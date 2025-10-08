const express = require('express');
const router = express.Router();
const bloodPressureReminderController = require('../controllers/bloodPressureReminder.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireFeature } = require('../middlewares/packageAccess.middleware');
const voiceAccessMiddleware = requireFeature('Nhắc đo huyết áp bằng giọng nói');

// Lấy danh sách nhắc đo huyết áp của user
router.get('/', authMiddleware, bloodPressureReminderController.getBloodPressureReminders);

// Tạo nhắc đo huyết áp
router.post('/',
  authMiddleware,
  (req, res, next) => {
    if (req.body.reminderType === 'voice') {
      return voiceAccessMiddleware(req, res, next);
    }
    next();
  },
  bloodPressureReminderController.createBloodPressureReminder
);

// Xem chi tiết nhắc đo huyết áp
router.get('/:id', authMiddleware, bloodPressureReminderController.getBloodPressureReminderById);

// Cập nhật nhắc đo huyết áp
router.put('/:id',
  authMiddleware,
  (req, res, next) => {
    if (req.body.reminderType === 'voice') {
      return voiceAccessMiddleware(req, res, next);
    }
    next();
  },
  bloodPressureReminderController.updateBloodPressureReminder
);

// Xóa nhắc đo huyết áp
router.delete('/:id', authMiddleware, bloodPressureReminderController.deleteBloodPressureReminder);

module.exports = router;
