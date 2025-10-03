// Swagger schema for RelativePatient

/**
 * @swagger
 * components:
 *   schemas:
 *     RelativePatient:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         patient:
 *           $ref: '#/components/schemas/User'
 *         relative:
 *           $ref: '#/components/schemas/User'
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [view_medical_records, schedule_medication, schedule_appointment, manage_health_data]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     CreateMedicationReminderRequest:
 *       type: object
 *       required:
 *         - medicationId
 *         - times
 *         - startDate
 *         - endDate
 *         - repeatTimes
 *       properties:
 *         medicationId:
 *           type: string
 *           description: ID của thuốc
 *         times:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 enum: [Sáng, Chiều, Tối]
 *         startDate:
 *           type: string
 *           format: date
 *           description: Ngày bắt đầu (YYYY-MM-DD)
 *         endDate:
 *           type: string
 *           format: date
 *           description: Ngày kết thúc (YYYY-MM-DD)
 *         repeatTimes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 description: Thời gian (HH:mm)
 *               taken:
 *                 type: boolean
 *                 default: false
 *         note:
 *           type: string
 *         reminderType:
 *           type: string
 *           enum: [normal, voice]
 *           default: normal
 *         voice:
 *           type: string
 *           enum: [banmai, lannhi, leminh, myan, thuminh, giahuy, linhsan]
 *           default: banmai
 *     
 *     CreateAppointmentRequest:
 *       type: object
 *       required:
 *         - title
 *         - hospital
 *         - date
 *         - time
 *       properties:
 *         title:
 *           type: string
 *           description: Tiêu đề cuộc hẹn
 *         hospital:
 *           type: string
 *           description: Bệnh viện
 *         location:
 *           type: string
 *           description: Địa chỉ
 *         date:
 *           type: string
 *           format: date-time
 *           description: Ngày hẹn
 *         time:
 *           type: string
 *           description: Giờ hẹn
 *         notes:
 *           type: string
 *           description: Ghi chú
 *     
 *     MedicationReminderResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         medicationId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             dosage:
 *               type: string
 *         reminderType:
 *           type: string
 *           enum: [normal, voice]
 *         times:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *         startDate:
 *           type: string
 *         endDate:
 *           type: string
 *         repeatTimes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *               taken:
 *                 type: boolean
 *         note:
 *           type: string
 *         voice:
 *           type: string
 *         isActive:
 *           type: boolean
 *         status:
 *           type: string
 *         createdBy:
 *           type: string
 *         createdByType:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     AppointmentResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         hospital:
 *           type: string
 *         location:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         time:
 *           type: string
 *         notes:
 *           type: string
 *         userId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         createdBy:
 *           type: string
 *         createdByType:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Medication:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *           description: ID của bệnh nhân
 *         name:
 *           type: string
 *           description: Tên thuốc
 *         form:
 *           type: string
 *           description: Dạng thuốc (viên, lọ, ...)
 *         image:
 *           type: string
 *           description: URL hình ảnh thuốc
 *         note:
 *           type: string
 *           description: Ghi chú
 *         quantity:
 *           type: string
 *           description: Tổng số lượng thuốc
 *         times:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 enum: [Sáng, Chiều, Tối]
 *               dosage:
 *                 type: string
 *                 description: Liều lượng cho từng buổi
 *         createdBy:
 *           type: string
 *           description: ID người tạo thuốc
 *         createdByType:
 *           type: string
 *           enum: [patient, relative, doctor]
 *           description: Loại người tạo
 *         createdAt:
 *           type: string
 *           format: date-time
 */
module.exports = {};
