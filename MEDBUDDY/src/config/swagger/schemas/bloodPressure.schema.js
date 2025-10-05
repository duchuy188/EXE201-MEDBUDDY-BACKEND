/**
 * @swagger
 * components:
 *   schemas:
 *     BloodPressure:
 *       type: object
 *       required:
 *         - userId
 *         - systolic
 *         - diastolic
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh của lần đo
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         systolic:
 *           type: number
 *           description: Huyết áp tâm thu
 *         diastolic:
 *           type: number
 *           description: Huyết áp tâm trương
 *         pulse:
 *           type: number
 *           description: Nhịp tim (nếu có)
 *         measuredAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian đo
 *         note:
 *           type: string
 *           description: Ghi chú
 *       example:
 *         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
 *         systolic: 135
 *         diastolic: 85
 *         pulse: 78
 *         measuredAt: "2025-08-08T08:00:00.000Z"
 *         note: "Đo buổi sáng khi vừa thức dậy"
 */
