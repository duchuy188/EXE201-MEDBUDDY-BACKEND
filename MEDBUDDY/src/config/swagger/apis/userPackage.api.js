/**
 * @swagger
 * tags:
 *   name: UserPackage
 *   description: Quản lý gói dịch vụ của user
 */

/**
 * @swagger
 * /user-package/my-package:
 *   get:
 *     tags: [UserPackage]
 *     summary: Lấy gói dịch vụ active của user hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin gói dịch vụ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gói dịch vụ active"
 *                 hasActivePackage:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     package:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         price:
 *                           type: number
 *                         duration:
 *                           type: number
 *                         unit:
 *                           type: string
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isActive:
 *                       type: boolean
 *                     daysRemaining:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /user-package/check-feature/{feature}:
 *   get:
 *     tags: [UserPackage]
 *     summary: Kiểm tra quyền sử dụng feature
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feature
 *         required: true
 *         schema:
 *           type: string
 *         description: Tên feature cần kiểm tra
 *         example: "Biểu đồ huyết áp hàng tuần"
 *     responses:
 *       200:
 *         description: Kết quả kiểm tra quyền
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Có quyền sử dụng"
 *                 hasAccess:
 *                   type: boolean
 *                   example: true
 *                 feature:
 *                   type: string
 *                   example: "Biểu đồ huyết áp hàng tuần"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /user-package/my-history:
 *   get:
 *     tags: [UserPackage]
 *     summary: Lấy lịch sử gói dịch vụ của user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lịch sử gói dịch vụ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lịch sử gói dịch vụ"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderCode:
 *                         type: number
 *                       package:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           duration:
 *                             type: number
 *                           unit:
 *                             type: string
 *                           features:
 *                             type: array
 *                             items:
 *                               type: string
 *                       amount:
 *                         type: number
 *                       paidAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [PAID, PENDING, CANCELLED, EXPIRED]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /user-package/admin/cancel/{userId}:
 *   put:
 *     tags: [UserPackage]
 *     summary: Hủy gói của user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Hủy gói thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hủy gói thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     userName:
 *                       type: string
 *                     packageStatus:
 *                       type: boolean
 *       403:
 *         description: Chỉ admin mới được truy cập
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /user-package/admin/extend/{userId}:
 *   put:
 *     tags: [UserPackage]
 *     summary: Gia hạn gói của user (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - additionalDuration
 *               - unit
 *             properties:
 *               additionalDuration:
 *                 type: number
 *                 description: Số lượng thời gian gia hạn
 *                 example: 30
 *               unit:
 *                 type: string
 *                 enum: [day, month, year]
 *                 description: Đơn vị thời gian
 *                 example: "day"
 *     responses:
 *       200:
 *         description: Gia hạn gói thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Gia hạn gói thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     userName:
 *                       type: string
 *                     newEndDate:
 *                       type: string
 *                       format: date-time
 *                     packageName:
 *                       type: string
 *       400:
 *         description: Thiếu thông tin gia hạn
 *       403:
 *         description: Chỉ admin mới được truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /user-package/admin/stats:
 *   get:
 *     tags: [UserPackage]
 *     summary: Thống kê gói dịch vụ (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê gói dịch vụ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Thống kê gói dịch vụ"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       packageName:
 *                         type: string
 *                       activeUsers:
 *                         type: number
 *       403:
 *         description: Chỉ admin mới được truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /user-package/admin/user/{userId}:
 *   get:
 *     tags: [UserPackage]
 *     summary: Lấy thông tin chi tiết user và gói (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Thông tin gói của user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Thông tin gói của user"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phoneNumber:
 *                           type: string
 *                     activePackage:
 *                       type: object
 *                       properties:
 *                         packageId:
 *                           type: object
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         features:
 *                           type: array
 *                           items:
 *                             type: string
 *                         isActive:
 *                           type: boolean
 *                     daysRemaining:
 *                       type: number
 *       403:
 *         description: Chỉ admin mới được truy cập
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi server
 */
