const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpay.controller');

// API tạo link thanh toán VNPay cho gói dịch vụ
router.post('/create-payment', vnpayController.createPaymentUrl);

module.exports = router;
