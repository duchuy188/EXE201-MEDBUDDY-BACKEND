/**
 * @swagger
 * components:
 *   schemas:
 *     Medication:
 *       type: object
 *       required:
*         - name
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
 *         form:
 *           type: string
 *           description: Dạng thuốc (viên, nước...)
 *         image:
 *           type: string
 *           description: Ảnh thuốc (URL)
 *         note:
 *           type: string
 *           description: Ghi chú
*         times:
*           type: array
*           description: Mảng các buổi uống và liều lượng
*           items:
*             type: object
*             properties:
*               timeOfDay:
*                 type: string
*                 description: Buổi uống (Sáng, Trưa, Chiều, Tối)
*               dosage:
*                 type: string
*                 description: Liều lượng uống
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
*         form: "viên nén"
*         image: "https://example.com/amlodipine.jpg"
*         note: "Uống vào buổi sáng sau ăn"
*         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
*         times:
*           - timeOfDay: "Sáng"
*             dosage: "1 viên"
*           - timeOfDay: "Tối"
*             dosage: "1 viên"
*         expirationDate: "2025-12-31"
 */
