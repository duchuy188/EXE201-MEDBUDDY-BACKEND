const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tạo các gói dịch vụ mặc định
router.post('/create', packageController.createDefaultPackages);

// Chỉnh sửa gói dịch vụ (chỉ admin)
router.put('/:id', authMiddleware, packageController.updatePackage);

// Thêm mới gói dịch vụ (chỉ admin)
router.post('/', authMiddleware, packageController.addPackage);
// Xóa gói dịch vụ (chỉ admin)
router.delete('/:id', authMiddleware, packageController.deletePackage);
// Lấy danh sách tất cả các gói dịch vụ
router.get('/', packageController.getAllPackages);

module.exports = router;
