const express = require('express');
const router = express.Router();
const medicationHistoryController = require('../controllers/medicationHistory.controller');

// Tạo lịch sử uống thuốc mới
router.post('/', medicationHistoryController.createHistory);

// Lấy lịch sử uống thuốc theo user
router.get('/user/:userId', medicationHistoryController.getHistoryByUser);

// Lấy tổng quan tuần uống thuốc (như trong app)
router.get('/user/:userId/weekly', medicationHistoryController.getWeeklyOverview);

// Lấy tất cả lịch sử với overview (không theo tuần)
router.get('/user/:userId/overview', medicationHistoryController.getFullOverview);

// Cập nhật trạng thái uống thuốc
router.put('/:id', medicationHistoryController.updateHistory);

// Xóa lịch sử uống thuốc
router.delete('/:id', medicationHistoryController.deleteHistory);

module.exports = router;
