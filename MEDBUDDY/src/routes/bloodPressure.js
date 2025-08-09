const express = require('express');
const router = express.Router();
const bpController = require('../controllers/bloodPressure.controller');

// POST /blood-pressure – Ghi nhận chỉ số huyết áp
router.post('/', bpController.createBloodPressure);

// GET /blood-pressure – Lấy lịch sử huyết áp
router.get('/', bpController.getBloodPressures);

// GET /blood-pressure/latest – Lấy lần đo mới nhất
router.get('/latest', bpController.getLatestBloodPressure);

// DELETE /blood-pressure/:id – Xóa lần đo
router.delete('/:id', bpController.deleteBloodPressure);

module.exports = router;
