/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - packageId
 *       properties:
 *         packageId:
 *           type: string
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *           description: ID của gói dịch vụ
 *     
 *     CreatePaymentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Tạo link thanh toán thành công"
 *         paymentUrl:
 *           type: string
 *           example: "https://pay.payos.vn/web/..."
 *           description: URL thanh toán PayOS
 *         orderCode:
 *           type: number
 *           example: 1703123456789
 *           description: Mã đơn hàng
 *     
 *     ConfirmPaymentRequest:
 *       type: object
 *       required:
 *         - orderCode
 *       properties:
 *         orderCode:
 *           type: number
 *           example: 1703123456789
 *           description: Mã đơn hàng
 *     
 *     ConfirmPaymentResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Thanh toán thành công"
 *         paymentInfo:
 *           type: object
 *           properties:
 *             orderCode:
 *               type: number
 *               example: 1703123456789
 *             amount:
 *               type: number
 *               example: 19000
 *             status:
 *               type: string
 *               example: "PAID"
 *             description:
 *               type: string
 *               example: "Thanh toán gói HAP+ CƠ BẢN"
 *     
 *     WebhookData:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           description: Dữ liệu webhook từ PayOS
 *         signature:
 *           type: string
 *           description: Chữ ký xác thực
 */

/**
 * @swagger
 * /api/payos/create-payment:
 *   post:
 *     summary: Tạo link thanh toán PayOS
 *     tags: [PayOS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       200:
 *         description: Tạo link thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePaymentResponse'
 *       400:
 *         description: Thông tin không hợp lệ
 *       401:
 *         description: Token không hợp lệ
 *       404:
 *         description: Package không tồn tại
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/payos/confirm-payment:
 *   post:
 *     summary: Xác nhận thanh toán
 *     tags: [PayOS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmPaymentRequest'
 *     responses:
 *       200:
 *         description: Xác nhận thanh toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConfirmPaymentResponse'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/payos/payment-info/{orderCode}:
 *   get:
 *     summary: Lấy thông tin giao dịch
 *     tags: [PayOS]
 *     parameters:
 *       - in: path
 *         name: orderCode
 *         required: true
 *         schema:
 *           type: number
 *         description: Mã đơn hàng
 *     responses:
 *       200:
 *         description: Thông tin giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Thông tin giao dịch"
 *                 paymentInfo:
 *                   type: object
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/payos/webhook:
 *   post:
 *     summary: Webhook nhận thông báo từ PayOS
 *     tags: [PayOS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "00"
 *                 description: Mã lỗi
 *               desc:
 *                 type: string
 *                 example: "success"
 *                 description: Thông tin lỗi
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 type: object
 *                 properties:
 *                   orderCode:
 *                     type: number
 *                     example: 123
 *                   amount:
 *                     type: number
 *                     example: 3000
 *                   description:
 *                     type: string
 *                     example: "VQRIO123"
 *                   accountNumber:
 *                     type: string
 *                     example: "12345678"
 *                   reference:
 *                     type: string
 *                     example: "TF230204212323"
 *                   transactionDateTime:
 *                     type: string
 *                     example: "2023-02-04 18:25:00"
 *                   currency:
 *                     type: string
 *                     example: "VND"
 *                   paymentLinkId:
 *                     type: string
 *                     example: "124c33293c43417ab7879e14c8d9eb18"
 *                   code:
 *                     type: string
 *                     example: "00"
 *                   desc:
 *                     type: string
 *                     example: "Thành công"
 *               signature:
 *                 type: string
 *                 example: "8d8640d802576397a1ce45ebda7f835055768ac7ad2e0bfb77f9b8f12cca4c7f"
 *                 description: Chữ ký xác thực
 *     responses:
 *       200:
 *         description: Webhook xử lý thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *                 code:
 *                   type: string
 *                   example: "00"
 *                 desc:
 *                   type: string
 *                   example: "success"
 *       400:
 *         description: Chữ ký không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid signature"
 *                 code:
 *                   type: string
 *                   example: "01"
 *                 desc:
 *                   type: string
 *                   example: "Invalid signature"
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/payos/return:
 *   get:
 *     summary: Return URL - xử lý khi thanh toán thành công
 *     tags: [PayOS]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Mã lỗi
 *         example: "00"
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Payment Link Id
 *         example: "2e4acf1083304877bf1a8c108b30cccd"
 *       - in: query
 *         name: cancel
 *         schema:
 *           type: string
 *         description: Trạng thái hủy
 *         example: "false"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PAID, PENDING, PROCESSING, CANCELLED]
 *         description: Trạng thái thanh toán
 *         example: "PAID"
 *       - in: query
 *         name: orderCode
 *         schema:
 *           type: number
 *         description: Mã đơn hàng
 *         example: 803347
 *     responses:
 *       302:
 *         description: Redirect về frontend
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/payos/cancel:
 *   get:
 *     summary: Cancel URL - xử lý khi hủy thanh toán
 *     tags: [PayOS]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Mã lỗi
 *         example: "01"
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Payment Link Id
 *         example: "2e4acf1083304877bf1a8c108b30cccd"
 *       - in: query
 *         name: cancel
 *         schema:
 *           type: string
 *         description: Trạng thái hủy
 *         example: "true"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PAID, PENDING, PROCESSING, CANCELLED]
 *         description: Trạng thái thanh toán
 *         example: "CANCELLED"
 *       - in: query
 *         name: orderCode
 *         schema:
 *           type: number
 *         description: Mã đơn hàng
 *         example: 803347
 *     responses:
 *       302:
 *         description: Redirect về frontend
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/payos/admin/payments:
 *   get:
 *     summary: Lịch sử giao dịch tất cả users (Admin only)
 *     tags: [PayOS Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, CANCELLED, EXPIRED]
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo orderCode
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalAmount:
 *                           type: number
 *                         totalPaid:
 *                           type: number
 *                         totalPending:
 *                           type: number
 *                         totalCancelled:
 *                           type: number
 *                         totalExpired:
 *                           type: number
 *                         countPaid:
 *                           type: integer
 *                         countPending:
 *                           type: integer
 *                         countCancelled:
 *                           type: integer
 *                         countExpired:
 *                           type: integer
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/payos/admin/dashboard-stats:
 *   get:
 *     summary: Thống kê tổng quan dashboard (Admin only)
 *     tags: [PayOS Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                         totalTransactions:
 *                           type: integer
 *                         successfulTransactions:
 *                           type: integer
 *                         pendingTransactions:
 *                           type: integer
 *                         cancelledTransactions:
 *                           type: integer
 *                         expiredTransactions:
 *                           type: integer
 *                         averageTransactionValue:
 *                           type: number
 *                         successRate:
 *                           type: number
 *                     dailyStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           statuses:
 *                             type: array
 *                           totalCount:
 *                             type: integer
 *                           totalAmount:
 *                             type: number
 *                     packageStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           packageName:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           totalRevenue:
 *                             type: number
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/payos/admin/payment/{orderCode}:
 *   get:
 *     summary: Chi tiết giao dịch (Admin only)
 *     tags: [PayOS Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderCode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Không tìm thấy giao dịch
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
