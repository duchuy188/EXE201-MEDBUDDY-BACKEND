const express = require('express');

const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');


const medicationsController = require('../controllers/medications.controller');


// GET /medications – Danh sách thuốc của người dùng
router.get('/', authMiddleware, medicationsController.getMedications);

// GET /medications/low-stock – Lấy danh sách thuốc sắp hết (phải đặt trước /:id)
router.get('/low-stock', authMiddleware, medicationsController.getLowStockMedications);

// POST /medications – Thêm thuốc mới
router.post('/', authMiddleware, medicationsController.createMedication);


// GET /medications/:id – Xem chi tiết thuốc
router.get('/:id', authMiddleware, medicationsController.getMedicationById);


// PUT /medications/:id – Cập nhật thông tin thuốc
router.put('/:id', authMiddleware, medicationsController.updateMedication);


// DELETE /medications/:id – Xóa thuốc
router.delete('/:id', authMiddleware, medicationsController.deleteMedication);

// Lưu nhiều thuốc từ OCR
router.post('/from-ocr', authMiddleware, medicationsController.createMedicationsFromOcr);

module.exports = router;
