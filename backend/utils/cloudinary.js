// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dmtyzcho1',
  api_key: '536783733535124',
  api_secret: 'JNDn-qOGnauO8Gnu5mgElDIokqw',
  secure: true
});

module.exports = cloudinary;