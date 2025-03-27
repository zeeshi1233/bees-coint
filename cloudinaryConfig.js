import {cloudinary as v2} from "cloudinary";
import CloudinaryStorage from "multer-storage-cloudinary";
const path = require("path");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});