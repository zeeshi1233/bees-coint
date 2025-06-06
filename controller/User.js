import bcrypt from "bcrypt";
import cloudinary from "../cloudinaryConfig.js";
import User from "../model/UserSchema.js";
import Joi from "joi";
import sendEmail from "../utils/sendMails.js";
import Otp from "../model/OtpSchema.js";
import jwt from "jsonwebtoken";
import RefferalSchema from "../model/RefferalSchema.js";
const userValidationSchema = Joi.object({
  firstName: Joi.string().required().trim(),
  // lastName: Joi.string().required().trim(),
  cpf: Joi.string()
    .length(11)
    .pattern(/^[0-9]{11}$/)
    .required(),
  email: Joi.string().email().required(),
  zipCode: Joi.string().required(),
  dob: Joi.string().required(),
  phoneNumber: Joi.string()
    .required()
    .pattern(/^\+?(\d{1,3})?(\d{10})$/),
  password: Joi.string().min(6).required(),
});

function generateRandomCpf() {
  const randomCpf = Math.floor(10000000000 + Math.random() * 90000000000);
  return randomCpf.toString();
}

export const Register = async (req, res) => {
  try {
    const cpf = generateRandomCpf();
    const { error } = userValidationSchema.validate({ ...req.body, cpf });

    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { firstName, lastName, email, phoneNumber, password, dob, zipCode } = req.body;

    const referralCode = req.query.referralCode || null;

    // console.log("Generated CPF:", cpf);

    // const images = req.files;

    // if (!images || images.length === 0) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "No image file uploaded." });
    // }

    // const uploadPromises = images.map((image) => {
    //   return new Promise((resolve, reject) => {
    //     if (!image.buffer || image.buffer.length === 0) {
    //       return reject(new Error("Invalid image buffer."));
    //     }

    //     const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    //     if (image.size > MAX_FILE_SIZE) {
    //       return reject(new Error("File size exceeds the 10MB limit."));
    //     }

    //     // Upload to Cloudinary
    //     cloudinary.uploader
    //       .upload_stream({ folder: "bees" }, (error, result) => {
    //         if (error) {
    //           console.error("Cloudinary upload error:", error);
    //           return reject(new Error("Error uploading image to Cloudinary."));
    //         }
    //         resolve({ src: result.secure_url }); // Return the image URL
    //       })
    //       .end(image.buffer);
    //   });
    // });

    // const uploadedImages = await Promise.all(uploadPromises);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      cpf,
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      zipCode,
      dob
    });

    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ success: false, message: "Invalid referral code." });
      }
    }

    const newReferralCode = referralCode;
    newUser.referralCode = newReferralCode;
    newUser.referredBy = referrer ? referrer._id : null;
    await newUser.save();

    if (referrer) {
      const referral = new RefferalSchema({
        user: newUser._id,
        referralCode: newReferralCode,
        referrer: referrer._id,
      });

      await referral.save();
    }

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      data: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        cpf: newUser.cpf,
        phoneNumber: newUser.phoneNumber,
        referralCode: newUser.referralCode,
        zipCode,
        dob
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
      error: error.message,
    });
  }
};

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: "No token provided" });
  }

  try {
    // Verify token with Google
    const googleUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    const response = await axios.get(googleUrl);

    const { email, given_name, family_name } = response.data;

    if (!email) {
      return res.status(400).json({ success: false, message: "Google token invalid" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user
      user = new User({
        email,
        firstName: given_name,
        lastName: family_name,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), // placeholder password
        cpf: generateRandomCpf(), // use your existing CPF generator
      });

      await user.save();
    }

    // Return success
    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        cpf: user.cpf,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ success: false, message: "Google login failed" });
  }
};

export const facebookLogin = async (req, res) => {
  const { accessToken, userID } = req.body;

  if (!accessToken || !userID) {
    return res.status(400).json({ success: false, message: "Missing Facebook credentials" });
  }

  try {
    const fbUrl = `https://graph.facebook.com/${userID}?fields=id,name,email,first_name,last_name&access_token=${accessToken}`;
    const response = await axios.get(fbUrl);

    const { email, first_name, last_name } = response.data;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email not found in Facebook response" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        firstName: first_name,
        lastName: last_name,
        password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
        cpf: generateRandomCpf(),
      });

      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Facebook login successful",
      data: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        cpf: user.cpf,
      },
    });
  } catch (error) {
    console.error("Facebook login error:", error);
    return res.status(500).json({ success: false, message: "Facebook login failed" });
  }
};

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
  return otp.toString();
}

export const SendOtp = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  try {
    const otp = generateOTP();
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 10); // Set OTP expiration time to 10 minutes

    const newOtp = new Otp({
      email,
      otp,
      expirationTime,
    });
    await newOtp.save();

    await sendEmail({
      to: email,
      subject: "Bees Coin OTP",
      message: `
      <!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>One-Time Verification Code</title>
                    </head>
                    <body style="font-family: Arial, sans-serif;">
                    <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
                        <div style="max-width: 600px; text-align: center; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
                            <h1 style="color:rgb(231, 219, 8); font-size: 36px;">Bees Coin</h1>
                            <h1 style="color: #000; font-size: 20px;">Action Required: One-Time Verification Code</h1>
                            <p style="color: #777; font-size: 16px;">You are receiving this email because a request was made for a one-time code that can be used for authentication.</p>
                            <p style="color: #777; font-size: 16px;">Please enter the following code for verification:</p>
                            <p style="font-size: 36px; color: #333; margin: 10px 0;">${otp}</p>                           
                        </div>
                    </div>
                    </body>
                    </html>    `,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      result: {
        otp,
      },
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const ValidateOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, error: "Email and OTP are required" });
  }

  try {
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    if (new Date() > otpRecord.expirationTime) {
      return res.status(400).json({ success: false, error: "OTP has expired" });
    }

    if (otpRecord.isUsed) {
      return res
        .status(400)
        .json({ success: false, error: "OTP has already been used" });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    await Otp.deleteMany({ email });

    // Respond with success
    res.status(200).json({
      success: true,
      message: "OTP validated successfully.",
    });
  } catch (error) {
    console.error("Error validating OTP:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check if user is verified before login
    // if (!user.isVerified) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Please verify your email before logging in",
    //   });
    // }

    // Compare the hashed password with the entered password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET_KEY // Secret key for JWT token
    );

    // Exclude password from user data
    const { password: userPassword, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body; // Get email from request body

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate a new OTP
    const otp = generateOTP();

    // Check if an OTP exists for this email, and if so, replace it
    await Otp.findOneAndUpdate(
      { email },
      { otp, expirationTime: Date.now() + 10 * 60 * 1000, isUsed: false },
      { new: true, upsert: true }
    );

    // Send OTP via email
    await sendEmail({
      to: email,
      subject: "Bees Coin - Password Reset OTP",
      message: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>One-Time Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
      <div style="width: 100%; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 600px; text-align: center; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
          <h1 style="color:rgb(231, 219, 8); font-size: 36px;">Bees Coin</h1>
          <h1 style="color: #000; font-size: 20px;">Password Reset OTP</h1>
          <p style="color: #777; font-size: 16px;">You are receiving this email because you requested a password reset. Please use the following OTP to reset your password:</p>
          <p style="font-size: 36px; color: #333; margin: 10px 0;">${otp}</p>
        </div>
      </div>
      </body>
      </html>
      `,
    });

    // Return success response
    res.status(200).json({
      success: true,
      message:
        "OTP sent successfully to your email. Please use it to reset your password.",
    });
  } catch (error) {
    console.error("Error during OTP generation or email sending:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Verify OTP for password reset
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  try {
    // Find the OTP entry in the database
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not found for this email" });
    }

    // Check if the OTP is expired or already used
    if (otpRecord.isUsed) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has already been used" });
    }

    if (Date.now() > otpRecord.expirationTime) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    // Validate the OTP
    if (otp !== otpRecord.otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Return success response for OTP verification
    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Reset the user's password
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Email and new password are required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id); // Find user by ID

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password, ...userWithoutPassword } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};
export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Returns an array
    console.log(users, "userss");

    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: usersWithoutPasswords,
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};



export const getReferrals = async (req, res) => {
  try {
    const referrals = await RefferalSchema.find({ referrer: req.params.id });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const toggleUserBlock = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Toggle the isVerified flag
    user.isVerified = !user.isVerified;
    await user.save();

    const action = user.isVerified ? "unblocked and verified" : "blocked and unverified";

    return res.status(200).json({
      success: true,
      message: `User has been ${action}`,
      data: {
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Error toggling user block:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
