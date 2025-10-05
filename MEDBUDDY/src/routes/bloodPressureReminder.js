const express = require('express');
const router = express.Router();
const bloodPressureReminderController = require('../controllers/bloodPressureReminder.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Lấy danh sách nhắc đo huyết áp của user
router.get('/', authMiddleware, bloodPressureReminderController.getBloodPressureReminders);

// Tạo nhắc đo huyết áp
router.post('/', authMiddleware, bloodPressureReminderController.createBloodPressureReminder);

// Xem chi tiết nhắc đo huyết áp
router.get('/:id', authMiddleware, bloodPressureReminderController.getBloodPressureReminderById);

// Cập nhật nhắc đo huyết áp
router.put('/:id', authMiddleware, bloodPressureReminderController.updateBloodPressureReminder);

// Xóa nhắc đo huyết áp
router.delete('/:id', authMiddleware, bloodPressureReminderController.deleteBloodPressureReminder);

module.exports = router;
