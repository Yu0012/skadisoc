const cloudinary = require("cloudinary").v2;
const functions = require("firebase-functions");

const config = functions.config();

cloudinary.config({
  cloud_name: config?.cloudinary?.cloud_name || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: config?.cloudinary?.api_key || process.env.CLOUDINARY_API_KEY,
  api_secret: config?.cloudinary?.api_secret || process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
