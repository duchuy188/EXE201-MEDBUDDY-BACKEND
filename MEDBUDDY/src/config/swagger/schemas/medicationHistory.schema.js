/**
 * @swagger
 * components:
 *   schemas:
 *     MedicationHistory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh của lịch sử uống thuốc
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         medicationId:
 *           type: string
 *           description: ID thuốc
 *         status:
 *           type: string
 *           enum: [taken, missed]
 *           description: Trạng thái (taken - đã uống, missed - bỏ quên)
 *         takenAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian ghi nhận
 *         note:
 *           type: string
 *           description: Ghi chú
 *       example:
 *         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
 *         medicationId: "64d1f2c2e1b2a3c4d5e6f7b9"
 *         status: "taken"
 *         takenAt: "2025-08-09T08:00:00.000Z"
 *         note: "Đã uống đúng giờ"
 */
