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
 */
