/**
 * @swagger
 * components:
 *   schemas:
 *     BloodPressureReminder:
 *       type: object
 *       required:
 *         - userId
 *         - times
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh của nhắc đo huyết áp
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         times:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 description: Giờ nhắc đo huyết áp (ví dụ "07:00")
 *         note:
 *           type: string
 *           description: Ghi chú
 *         isActive:
 *           type: boolean
 *           description: Trạng thái kích hoạt nhắc nhở
 *         status:
 *           type: string
 *           enum: [pending, completed, snoozed]
 *           description: Trạng thái nhắc nhở
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật
 *       example:
 *         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
 *         times: [{ "time": "07:00" }]
 *         note: "Đã đến giờ đo huyết áp!"
 *         isActive: true
 *         status: "pending"
 *         createdAt: "2025-10-01T04:15:14.569+00:00"
 *         updatedAt: "2025-10-01T04:15:14.569+00:00"
 */
