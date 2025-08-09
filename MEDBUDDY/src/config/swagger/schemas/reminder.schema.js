/**
 * @swagger
 * components:
 *   schemas:
 *     Reminder:
 *       type: object
 *       required:
 *         - userId
 *         - medicationId
 *         - time
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh của nhắc nhở
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         medicationId:
 *           type: string
 *           description: ID thuốc
 *         time:
 *           type: string
 *           description: Thời gian nhắc (HH:mm hoặc ISO)
 *         repeat:
 *           type: string
 *           enum: [daily, weekly, custom]
 *           description: Lặp lại (daily, weekly, custom)
 *         note:
 *           type: string
 *           description: Ghi chú
 *         isActive:
 *           type: boolean
 *           description: Đang bật nhắc nhở
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo
 *       example:
 *         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
 *         medicationId: "64d1f2c2e1b2a3c4d5e6f7b9"
 *         time: "08:00"
 *         repeat: "daily"
 *         note: "Uống sau khi ăn sáng"
 *         isActive: true
 */
