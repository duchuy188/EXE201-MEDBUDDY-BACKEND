const express = require('express');
const router = express.Router();
const bpController = require('../controllers/bloodPressure.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// POST /blood-pressure – Ghi nhận chỉ số huyết áp
router.post('/', authMiddleware, bpController.createBloodPressure);

// GET /blood-pressure – Lấy lịch sử huyết áp
router.get('/', authMiddleware, bpController.getBloodPressures);

// GET /blood-pressure/latest – Lấy lần đo mới nhất
router.get('/latest', authMiddleware, bpController.getLatestBloodPressure);

// DELETE /blood-pressure/:id – Xóa lần đo
router.delete('/:id', authMiddleware, bpController.deleteBloodPressure);

module.exports = router;
