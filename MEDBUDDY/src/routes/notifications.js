const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// POST /notifications/token – Lưu token thiết bị
router.post('/token', notificationController.saveToken);

// POST /notifications/send – Gửi thông báo nhắc uống thuốc
router.post('/send', notificationController.sendNotification);

// GET /notifications/history – Lịch sử thông báo đã gửi
router.get('/history', notificationController.getNotificationHistory);

module.exports = router;
