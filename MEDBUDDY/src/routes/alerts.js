const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');

// GET /alerts – Danh sách cảnh báo
router.get('/', alertController.getAlerts);

// POST /alerts/acknowledge – Xác nhận đã đọc cảnh báo
router.post('/acknowledge', alertController.acknowledgeAlert);

module.exports = router;
