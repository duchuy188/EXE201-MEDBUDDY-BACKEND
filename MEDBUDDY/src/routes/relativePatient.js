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

// ========== API ĐẶT LỊCH CHO BỆNH NHÂN BỞI NGƯỜI THÂN ==========

// Đặt lịch uống thuốc cho bệnh nhân
router.post('/patients/:patientId/medication-reminder', authMiddleware, relativePatientController.createMedicationReminderForPatient);

// Đặt lịch tái khám cho bệnh nhân
router.post('/patients/:patientId/appointment', authMiddleware, relativePatientController.createAppointmentForPatient);

// Lấy danh sách lịch uống thuốc của bệnh nhân
router.get('/patients/:patientId/medication-reminders', authMiddleware, relativePatientController.getPatientMedicationReminders);

// Lấy danh sách lịch tái khám của bệnh nhân
router.get('/patients/:patientId/appointments', authMiddleware, relativePatientController.getPatientAppointments);

// Cập nhật lịch uống thuốc của bệnh nhân
router.put('/patients/:patientId/medication-reminder/:reminderId', authMiddleware, relativePatientController.updatePatientMedicationReminder);

// Cập nhật lịch tái khám của bệnh nhân
router.put('/patients/:patientId/appointment/:appointmentId', authMiddleware, relativePatientController.updatePatientAppointment);

// Xóa lịch uống thuốc của bệnh nhân
router.delete('/patients/:patientId/medication-reminder/:reminderId', authMiddleware, relativePatientController.deletePatientMedicationReminder);

// Xóa lịch tái khám của bệnh nhân
router.delete('/patients/:patientId/appointment/:appointmentId', authMiddleware, relativePatientController.deletePatientAppointment);

// API debug - Kiểm tra quyền của người thân
router.get('/patients/:patientId/permissions', authMiddleware, relativePatientController.checkRelativePermissions);

// API cập nhật permissions cho mối quan hệ
router.put('/relationship/:linkId/permissions', authMiddleware, relativePatientController.updateRelativePermissions);

// API fix permissions cho các mối quan hệ đã tồn tại
router.post('/fix-permissions', authMiddleware, relativePatientController.fixExistingPermissions);

// API test authentication
router.get('/test-auth', authMiddleware, relativePatientController.testAuth);

// API nhanh để fix permissions cho một mối quan hệ cụ thể
router.post('/patients/:patientId/fix-permissions', authMiddleware, relativePatientController.quickFixPermissions);

// ========== API QUẢN LÝ THUỐC CHO BỆNH NHÂN ==========

// Lấy danh sách thuốc của bệnh nhân
router.get('/patients/:patientId/medications', authMiddleware, relativePatientController.getPatientMedications);

// Thêm thuốc mới cho bệnh nhân
router.post('/patients/:patientId/medications', authMiddleware, relativePatientController.createMedicationForPatient);

// Lấy chi tiết thuốc cụ thể của bệnh nhân
router.get('/patients/:patientId/medications/:medicationId', authMiddleware, relativePatientController.getPatientMedicationById);

// Cập nhật thuốc của bệnh nhân
router.put('/patients/:patientId/medications/:medicationId', authMiddleware, relativePatientController.updatePatientMedication);

// Xóa thuốc của bệnh nhân
router.delete('/patients/:patientId/medications/:medicationId', authMiddleware, relativePatientController.deletePatientMedication);

module.exports = router;
