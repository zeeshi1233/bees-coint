import express from "express";
import {  forgotPassword, getProfile, getReferrals, getUsers, Login, Register, resetPassword, SendOtp, toggleUserBlock, ValidateOtp, verifyOtp } from "../controller/User.js";  // Import the controller
import { protect } from "../Middleware/ProtectedRoutes.js";

const UserRouter = express.Router();

UserRouter.post("/register", Register);  
UserRouter.post("/send-otp",SendOtp);  
UserRouter.post("/verify-otp",ValidateOtp);  
UserRouter.post("/login", Login);

UserRouter.post("/forgot-password", forgotPassword);

UserRouter.post("/verify-reset-otp", verifyOtp);
UserRouter.get("/get-users",protect,getUsers);

UserRouter.post("/reset-password", resetPassword);
UserRouter.get("/get-profile/:id", protect,getProfile);
UserRouter.post("/user-blocked",protect,toggleUserBlock);
UserRouter.get('/getReffer/:id',protect, getReferrals);

export default UserRouter;
