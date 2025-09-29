const express = require('express');
const router = express.Router();
const relativePatientController = require('../controllers/relativePatient.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// API khởi tạo 3 gói dịch vụ
router.post('/create-packages', relativePatientController.createDefaultPackages);

// Thêm liên kết người thân-người bệnh
router.post('/add', authMiddleware, relativePatientController.addRelativePatient);

// Người thân thêm người bệnh
router.post('/add-patient', authMiddleware, relativePatientController.addPatientForRelative);

// Xác nhận liên kết bằng OTP
router.post('/confirm', relativePatientController.confirmRelativePatient);

// Lấy danh sách người bệnh của người thân
router.get('/patients', authMiddleware, relativePatientController.getPatientsOfRelative);

// Lấy danh sách người thân của người bệnh
router.get('/relatives', authMiddleware, relativePatientController.getRelativesOfPatient);

// Xóa liên kết giữa người bệnh và người thân
router.post('/delete', authMiddleware, relativePatientController.deleteRelativePatient);

// API chỉnh sửa gói dịch vụ (chỉ admin)
router.put('/package/:id', authMiddleware, relativePatientController.updatePackage);

module.exports = router;
