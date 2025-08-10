const express = require('express');

const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const alertController = require('../controllers/alert.controller');

// GET /alerts – Danh sách cảnh báo
router.get('/', authMiddleware, alertController.getAlerts);

// POST /alerts/acknowledge – Xác nhận đã đọc cảnh báo
router.post('/acknowledge', authMiddleware, alertController.acknowledgeAlert);

module.exports = router;
