const express = require('express');
const router = express.Router();
const medicationHistoryController = require('../controllers/medicationHistory.controller');

// POST /medications/history – Ghi nhận đã uống thuốc/đã bỏ quên
router.post('/history', medicationHistoryController.createMedicationHistory);

// GET /medications/history – Xem lại lịch sử uống thuốc
router.get('/history', medicationHistoryController.getMedicationHistory);

module.exports = router;
