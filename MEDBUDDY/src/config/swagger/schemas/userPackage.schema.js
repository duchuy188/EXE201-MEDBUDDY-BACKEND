/**
 * @swagger
 * components:
 *   schemas:
 *     UserPackage:
 *       type: object
 *       properties:
 *         packageId:
 *           type: string
 *           description: ID của gói dịch vụ
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Ngày bắt đầu gói
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Ngày kết thúc gói
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách tính năng của gói
 *         isActive:
 *           type: boolean
 *           description: Trạng thái gói có đang active không
 *       example:
 *         packageId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         startDate: "2024-01-01T00:00:00.000Z"
 *         endDate: "2024-01-31T23:59:59.999Z"
 *         features: ["Biểu đồ huyết áp hàng tuần", "Cảnh báo huyết áp bất thường"]
 *         isActive: true
 *     
 *     PackageStats:
 *       type: object
 *       properties:
 *         packageName:
 *           type: string
 *           description: Tên gói dịch vụ
 *         activeUsers:
 *           type: number
 *           description: Số user đang sử dụng gói
 *       example:
 *         packageName: "GÓI HAP+ CƠ BẢN"
 *         activeUsers: 25
 *     
 *     UserPackageHistory:
 *       type: object
 *       properties:
 *         orderCode:
 *           type: number
 *           description: Mã giao dịch
 *         package:
 *           $ref: '#/components/schemas/Package'
 *         amount:
 *           type: number
 *           description: Số tiền thanh toán
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian thanh toán
 *         status:
 *           type: string
 *           enum: [PAID, PENDING, CANCELLED, EXPIRED]
 *           description: Trạng thái thanh toán
 *       example:
 *         orderCode: 1704067200000
 *         package:
 *           _id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *           name: "GÓI HAP+ CƠ BẢN"
 *           price: 19000
 *           duration: 1
 *           unit: "month"
 *           features: ["Biểu đồ huyết áp hàng tuần", "Cảnh báo huyết áp bất thường"]
 *         amount: 19000
 *         paidAt: "2024-01-01T10:30:00.000Z"
 *         status: "PAID"
 *     
 *     FeatureAccess:
 *       type: object
 *       properties:
 *         hasAccess:
 *           type: boolean
 *           description: Có quyền sử dụng feature không
 *         feature:
 *           type: string
 *           description: Tên feature
 *         message:
 *           type: string
 *           description: Thông báo
 *       example:
 *         hasAccess: true
 *         feature: "Biểu đồ huyết áp hàng tuần"
 *         message: "Có quyền sử dụng"
 *     
 *     PackageExtendRequest:
 *       type: object
 *       required:
 *         - additionalDuration
 *         - unit
 *       properties:
 *         additionalDuration:
 *           type: number
 *           description: Số lượng thời gian gia hạn
 *           example: 30
 *         unit:
 *           type: string
 *           enum: [day, month, year]
 *           description: Đơn vị thời gian
 *           example: "day"
 *     
 *     UserPackageInfo:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             fullName:
 *               type: string
 *             email:
 *               type: string
 *             phoneNumber:
 *               type: string
 *         activePackage:
 *           $ref: '#/components/schemas/UserPackage'
 *         daysRemaining:
 *           type: number
 *           description: Số ngày còn lại
 *       example:
 *         user:
 *           id: "60f7b3b3b3b3b3b3b3b3b3b3"
 *           fullName: "Nguyễn Văn A"
 *           email: "user@example.com"
 *           phoneNumber: "0123456789"
 *         activePackage:
 *           packageId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *           startDate: "2024-01-01T00:00:00.000Z"
 *           endDate: "2024-01-31T23:59:59.999Z"
 *           features: ["Biểu đồ huyết áp hàng tuần", "Cảnh báo huyết áp bất thường"]
 *           isActive: true
 *         daysRemaining: 15
 */
