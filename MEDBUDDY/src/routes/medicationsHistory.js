const express = require('express');

const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const medicationHistoryController = require('../controllers/medicationHistory.controller');

// POST /medications/history – Ghi nhận đã uống thuốc/đã bỏ quên
router.post('/history', authMiddleware, medicationHistoryController.createMedicationHistory);

// GET /medications/history – Xem lại lịch sử uống thuốc
router.get('/history', authMiddleware, medicationHistoryController.getMedicationHistory);

module.exports = router;
