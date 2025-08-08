const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cấu hình Cloudinary từ biến môi trường
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload một file lên Cloudinary
 * @param {string} filePath Đường dẫn file local
 * @param {object} options Tuỳ chọn upload (nếu có)
 * @returns {Promise<object>} Thông tin file đã upload
 */
const uploadToCloudinary = (filePath, options = {}) => {
  return cloudinary.uploader.upload(filePath, options);
};

module.exports = {
  uploadToCloudinary,
  cloudinary, // export nếu cần dùng các API khác
};
