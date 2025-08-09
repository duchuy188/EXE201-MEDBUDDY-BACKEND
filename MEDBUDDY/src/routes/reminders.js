const express = require('express');
const router = express.Router();
const remindersController = require('../controllers/reminders.controller');

// GET /reminders – Danh sách nhắc uống thuốc
router.get('/', remindersController.getReminders);

// POST /reminders – Thêm nhắc uống thuốc
router.post('/', remindersController.createReminder);

// GET /reminders/:id – Xem chi tiết nhắc nhở
router.get('/:id', remindersController.getReminderById);

// PUT /reminders/:id – Cập nhật nhắc nhở
router.put('/:id', remindersController.updateReminder);

// DELETE /reminders/:id – Xóa nhắc nhở
router.delete('/:id', remindersController.deleteReminder);

module.exports = router;
