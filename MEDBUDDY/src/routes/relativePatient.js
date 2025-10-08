const express = require('express');
const router = express.Router();
const relativePatientController = require('../controllers/relativePatient.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireFeatureForUser } = require('../middlewares/packageAccess.middleware');
const upload = require('../middlewares/upload.middleware');

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

// Người thân tạo link thanh toán để mua gói cho bệnh nhân
router.post('/patients/:patientId/purchase-package', authMiddleware, relativePatientController.createPaymentLinkForPatient);

// Lấy lịch sử huyết áp của bệnh nhân (cho người thân)
router.get('/patients/:patientId/blood-pressures', authMiddleware, relativePatientController.getPatientBloodPressures);

// Lấy lần đo huyết áp mới nhất của bệnh nhân (cho người thân)
router.get('/patients/:patientId/blood-pressures/latest', authMiddleware, relativePatientController.getPatientLatestBloodPressure);

// Lấy tổng quan tuần uống thuốc của bệnh nhân (cho người thân)
router.get('/patients/:patientId/medication-history/weekly', authMiddleware, relativePatientController.getPatientWeeklyOverview);

// Lấy toàn bộ overview lịch sử uống thuốc của bệnh nhân (cho người thân)
router.get('/patients/:patientId/medication-history/overview', authMiddleware, relativePatientController.getPatientFullOverview);

// Gói của bệnh nhân (cho người thân)
router.get('/patients/:patientId/my-package', (req, res, next) => {
	try {
		// Log requester info early (before auth) so we see all hits
		const maybeUser = req.user ? req.user._id : (req.headers && req.headers.authorization ? 'has-token' : 'no-token');
		console.log(`[route] GET /relative-patient/patients/${req.params.patientId}/my-package called, requester=${maybeUser}`);
	} catch (e) {
		console.error('Logging middleware error for my-package route:', e && (e.stack || e.message || e));
	}
	next();
}, authMiddleware, relativePatientController.getPatientActivePackage);
router.get('/patients/:patientId/check-feature/:feature', authMiddleware, relativePatientController.checkPatientFeatureAccess);
router.get('/patients/:patientId/my-history', authMiddleware, relativePatientController.getPatientPackageHistory);

// Lấy chi tiết thuốc cụ thể của bệnh nhân
router.get('/patients/:patientId/medications/:medicationId', authMiddleware, relativePatientController.getPatientMedicationById);

// Cập nhật thuốc của bệnh nhân
router.put('/patients/:patientId/medications/:medicationId', authMiddleware, relativePatientController.updatePatientMedication);

// Xóa thuốc của bệnh nhân
router.delete('/patients/:patientId/medications/:medicationId', authMiddleware, relativePatientController.deletePatientMedication);

// Lưu nhiều thuốc từ OCR cho bệnh nhân bởi người thân
// Lưu nhiều thuốc từ payload (JSON)
router.post('/patients/:patientId/medications/from-ocr', authMiddleware, requireFeatureForUser('Phân tích đơn thuốc'), relativePatientController.createMedicationsFromOcrForPatient);

// Upload ảnh, thực hiện OCR và lưu thuốc cho bệnh nhân (người thân)
router.post('/patients/:patientId/medications/from-ocr-image', authMiddleware, requireFeatureForUser('Phân tích đơn thuốc'), upload.single('image'), relativePatientController.createMedicationsFromOcrImageForPatient);

module.exports = router;
