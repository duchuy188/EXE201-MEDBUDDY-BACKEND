// Routes admin
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');


const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
  }
  next();
};

// Dashboard admin
router.get('/dashboard', authMiddleware, adminOnly, adminController.dashboard);

// User Management CRUD
router.get('/users', authMiddleware, adminOnly, adminController.getAllUsers);
router.get('/users/:id', authMiddleware, adminOnly, adminController.getUserById);
router.post('/users', authMiddleware, adminOnly, adminController.createUser);
router.put('/users/:id', authMiddleware, adminOnly, adminController.updateUser);
router.patch('/users/:id/block', authMiddleware, adminOnly, adminController.blockUser);
router.patch('/users/:id/unblock', authMiddleware, adminOnly, adminController.unblockUser);



// Chạy kiểm tra gói hết hạn thủ công
router.post('/package/check-expiry', authMiddleware, adminOnly, adminController.runPackageExpiryCheck);

// Chạy kiểm tra gói sắp hết hạn thủ công
router.post('/package/check-expiring-soon', authMiddleware, adminOnly, adminController.runPackageExpiringSoonCheck);

module.exports = router;