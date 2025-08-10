/**
 * @swagger
 * components:
 *   schemas:
 *     Medication:
 *       type: object
 *       required:
 *         - name
 *         - dosage
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh của thuốc
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         name:
 *           type: string
 *           description: Tên thuốc
 *         dosage:
 *           type: string
 *           description: Liều lượng
 *         form:
 *           type: string
 *           description: Dạng thuốc (viên, nước...)
 *         image:
 *           type: string
 *           description: Ảnh thuốc (URL)
 *         note:
 *           type: string
 *           description: Ghi chú
 *         timeOfDay:
 *           type: string
 *           description: Thời gian uống (Sáng, Chiều, Tối)
 *         time:
 *           type: string
 *           description: Giờ uống cụ thể (HH:mm)
 *         expirationDate:
 *           type: string
 *           format: date
 *           description: Hạn sử dụng
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo
 *       example:
 *         name: "Amlodipine 5mg"
 *         dosage: "1 viên/ngày"
 *         form: "viên nén"
 *         image: "https://example.com/amlodipine.jpg"
 *         note: "Uống vào buổi sáng sau ăn"
 *         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
 *         timeOfDay: "Sáng"
 *         time: "07:00"
 *         expirationDate: "2025-12-31"
 */
