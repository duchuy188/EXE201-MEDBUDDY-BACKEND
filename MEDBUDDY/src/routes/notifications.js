const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// POST /notifications/token – Lưu token thiết bị
router.post('/token', notificationController.saveToken);

// POST /notifications/send – Gửi thông báo nhắc uống thuốc
router.post('/send', notificationController.sendNotification);


// POST /notifications/delete-token – Xóa token thiết bị khi logout
router.post('/delete-token', notificationController.deleteToken);

// GET /notifications/history – Lịch sử thông báo đã gửi
router.get('/history', notificationController.getNotificationHistory);

module.exports = router;
