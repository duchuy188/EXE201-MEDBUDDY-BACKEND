const express = require('express');
const router = express.Router();


const medicationsController = require('../controllers/medications.controller');


// GET /medications – Danh sách thuốc của người dùng
router.get('/', medicationsController.getMedications);


// POST /medications – Thêm thuốc mới
router.post('/', medicationsController.createMedication);


// GET /medications/:id – Xem chi tiết thuốc
router.get('/:id', medicationsController.getMedicationById);


// PUT /medications/:id – Cập nhật thông tin thuốc
router.put('/:id', medicationsController.updateMedication);


// DELETE /medications/:id – Xóa thuốc
router.delete('/:id', medicationsController.deleteMedication);

module.exports = router;
