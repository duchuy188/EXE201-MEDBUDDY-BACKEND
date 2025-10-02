/**
 * @swagger
 * components:
 *   schemas:
 *     MedicationHistory:
 *       type: object
 *       required:
 *         - userId
 *         - medicationId
 *         - reminderId
 *         - date
 *         - time
 *       properties:
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         medicationId:
 *           type: string
 *           description: ID thuốc
 *         reminderId:
 *           type: string
 *           description: ID nhắc nhở
 *         date:
 *           type: string
 *           example: '2025-10-01'
 *           description: Ngày uống thuốc (YYYY-MM-DD)
 *         time:
 *           type: string
 *           example: '08:00'
 *           description: Giờ uống thuốc (HH:mm)
 *         taken:
 *           type: boolean
 *           default: false
 *           description: Đã uống chưa
 *         takenAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm xác nhận uống
 *         status:
 *           type: string
 *           enum: [on_time, late, missed]
 *           default: missed
 *           description: Trạng thái uống thuốc
 */
