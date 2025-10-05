/**
 * @swagger
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh của cảnh báo
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         type:
 *           type: string
 *           description: Loại cảnh báo (blood_pressure, ...)
 *         message:
 *           type: string
 *           description: Nội dung cảnh báo
 *         data:
 *           type: object
 *           description: Dữ liệu liên quan (nếu có)
 *         isRead:
 *           type: boolean
 *           description: Đã đọc hay chưa
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: Ngày xác nhận đã đọc
 *       example:
 *         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
 *         type: "blood_pressure"
 *         message: "Huyết áp cao nguy hiểm!"
 *         data: { systolic: 180, diastolic: 110 }
 *         isRead: false
 *         createdAt: "2025-08-09T08:00:00.000Z"
 *         readAt: null
 */
