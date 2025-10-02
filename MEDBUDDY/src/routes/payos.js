const express = require('express');
const router = express.Router();
const payosController = require('../controllers/payos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Tạo payment link (cần đăng nhập)
router.post('/create-payment', authMiddleware, payosController.createPaymentLink);

// Xác nhận thanh toán
router.post('/confirm-payment', payosController.confirmPayment);

// Lấy thông tin payment link
router.get('/payment-info/:orderCode', payosController.getPaymentInfo);

// Webhook từ PayOS (không cần auth)
router.post('/webhook', payosController.webhook);

// Return URL - xử lý khi thanh toán thành công
router.get('/return', payosController.handleReturn);

// Cancel URL - xử lý khi hủy thanh toán
router.get('/cancel', payosController.handleCancel);


// Middleware kiểm tra admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Chỉ admin mới có quyền truy cập' 
    });
  }
  next();
};

// Lịch sử giao dịch tất cả users
router.get('/admin/payments', authMiddleware, adminOnly, payosController.getAllPaymentHistory);

// Thống kê dashboard
router.get('/admin/dashboard-stats', authMiddleware, adminOnly, payosController.getDashboardStats);

// Chi tiết giao dịch
router.get('/admin/payment/:orderCode', authMiddleware, adminOnly, payosController.getPaymentDetail);

router.post('/activate-trial', authMiddleware, payosController.activateTrialPackage);

module.exports = router;
