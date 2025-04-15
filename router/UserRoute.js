import express from "express";
import { forgotPassword, getProfile, getReferrals, Login, Register, resetPassword, SendOtp, ValidateOtp, verifyOtp } from "../controller/User.js";  // Import the controller
import upload from "../Middleware/uploadMiddleware.js";  // Import the controller
import { protect } from "../Middleware/ProtectedRoutes.js";

const UserRouter = express.Router();

UserRouter.post("/register",upload, Register);  
UserRouter.post("/send-otp",SendOtp);  
UserRouter.post("/verify-otp",ValidateOtp);  
UserRouter.post("/login", Login);

UserRouter.post("/forgot-password", forgotPassword);

UserRouter.post("/verify-reset-otp", verifyOtp);

UserRouter.post("/reset-password", resetPassword);
UserRouter.get("/get-profile/:id", protect,getProfile);
UserRouter.get('/getReffer/:id',protect, getReferrals);

export default UserRouter;
