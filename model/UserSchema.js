import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    cpf: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{11}$/, // CPF should be 11 digits (Brazilian CPF format)
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /.+\@.+\..+/, // Simple email validation regex
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^\+?(\d{1,3})?(\d{10})$/, // Simple regex to match a valid phone number
    },    
    zipCode: {
      type: String,
      required: true,
    },    
    dob: {
      type: String,
      required: true,
    },    
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    adminApproval: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      unique: true,  // Ensure each user has a unique referral code
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // This will store the user who referred the current user
    },
    investments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Investment',  // Reference to the Investment model
      },
    ],
    referrals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referral',  // Reference to the Referral model
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps to the schema
);

const User = mongoose.model('User', userSchema);

export default User;
