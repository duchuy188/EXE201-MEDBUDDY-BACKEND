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
 *             $ref: '#/components/schemas/WebhookData'
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
 *       400:
 *         description: Chữ ký không hợp lệ
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
