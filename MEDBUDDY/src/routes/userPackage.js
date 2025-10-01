const express = require('express');
const router = express.Router();
const userPackageController = require('../controllers/userPackage.controller');
const authMiddleware = require('../middlewares/auth.middleware');



// Lấy gói active của user hiện tại
router.get('/my-package', authMiddleware, userPackageController.getMyActivePackage);

// Kiểm tra quyền sử dụng feature
router.get('/check-feature/:feature', authMiddleware, userPackageController.checkFeatureAccess);

// Lấy lịch sử gói của user
router.get('/my-history', authMiddleware, userPackageController.getMyPackageHistory);



// Hủy gói của user
router.put('/admin/cancel/:userId', authMiddleware, userPackageController.cancelUserPackage);

// Gia hạn gói của user
router.put('/admin/extend/:userId', authMiddleware, userPackageController.extendUserPackage);

// Thống kê gói
router.get('/admin/stats', authMiddleware, userPackageController.getPackageStats);

// Lấy thông tin chi tiết user và gói
router.get('/admin/user/:userId', authMiddleware, userPackageController.getUserPackageInfo);

module.exports = router;
