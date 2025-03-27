import express from "express";
import { Register } from "../controller/User.js";
import { uploadMiddleware } from "../Midleware/uploadMiddleware.js";
const UserRouter = express.Router();

const upload = uploadMiddleware("image");

UserRouter.post("/register", upload.single("file"),Register)


export default UserRouter;