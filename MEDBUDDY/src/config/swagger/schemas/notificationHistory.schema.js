/**
 * @swagger
 * components:
 *   schemas:
 *     NotificationHistory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh của lịch sử thông báo
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         title:
 *           type: string
 *           description: Tiêu đề thông báo
 *         body:
 *           type: string
 *           description: Nội dung thông báo
 *         sentAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian gửi
 *         deviceToken:
 *           type: string
 *           description: Token thiết bị đã gửi
 *       example:
 *         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
 *         title: "Nhắc nhở uống thuốc"
 *         body: "Đã đến giờ uống thuốc, bạn nhớ uống đúng giờ nhé!"
 *         sentAt: "2025-08-09T08:00:00.000Z"
 *         deviceToken: "fcm_device_token_example"
 */
