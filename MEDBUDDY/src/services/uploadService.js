

const { cloudinary } = require('./cloudinaryService');
const streamifier = require('streamifier');

/**
 * Upload buffer lên Cloudinary
 * @param {Buffer} buffer Buffer file từ multer memoryStorage
 * @param {object} options Tuỳ chọn upload (nếu có)
 * @returns {Promise<object>} Thông tin file đã upload
 */
const uploadImage = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = {
  uploadImage,
};
