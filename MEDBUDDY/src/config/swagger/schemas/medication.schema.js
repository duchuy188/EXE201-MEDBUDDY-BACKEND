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
 *         quantity:
 *           type: string
 *           description: Tổng số lượng thuốc (giữ nguyên để tương thích)
 *         totalQuantity:
 *           type: number
 *           description: Tổng số lượng ban đầu
 *           example: 30
 *         remainingQuantity:
 *           type: number
 *           description: Số lượng còn lại
 *           example: 25
 *         lowStockThreshold:
 *           type: number
 *           description: Ngưỡng cảnh báo (mặc định 5 viên)
 *           example: 5
 *         isLowStock:
 *           type: boolean
 *           description: Đã cảnh báo chưa
 *           example: false
 *         lastRefillDate:
 *           type: string
 *           format: date-time
 *           description: Ngày mua thêm gần nhất
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
*         note: "Uống vào buổi sáng sau ăn"
*         totalQuantity: 30
*         remainingQuantity: 25
*         lowStockThreshold: 5
*         isLowStock: false
*         lastRefillDate: "2024-01-15T00:00:00.000Z"
*         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
*         times:
*           - time: "Sáng"
*             dosage: "1 viên"
*           - time: "Tối"
*             dosage: "1 viên"
*         createdAt: "2024-01-01T00:00:00.000Z"
 */
