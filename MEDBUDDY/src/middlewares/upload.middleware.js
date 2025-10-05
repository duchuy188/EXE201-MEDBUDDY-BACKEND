const multer = require('multer');

// Sử dụng memoryStorage để upload trực tiếp từ buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
