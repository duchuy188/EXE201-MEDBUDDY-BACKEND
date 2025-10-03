/**
 * @swagger
 * tags:
 *   name: AdminPackage
 *   description: Quản lý gói dịch vụ cho Admin
 */

/**
 * @swagger
 * /api/admin/package/check-expiry:
 *   post:
 *     tags: [AdminPackage]
 *     summary: Chạy kiểm tra gói hết hạn thủ công (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kiểm tra gói hết hạn hoàn thành
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kiểm tra gói hết hạn hoàn thành"
 *                 data:
 *                   type: object
 *                   properties:
 *                     expiredCount:
 *                       type: number
 *                       description: Số gói hết hạn
 *                     expiredUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           userEmail:
 *                             type: string
 *                           packageName:
 *                             type: string
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *       403:
 *         description: Chỉ admin mới được truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/admin/package/check-expiring-soon:
 *   post:
 *     tags: [AdminPackage]
 *     summary: Chạy kiểm tra gói sắp hết hạn thủ công (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kiểm tra gói sắp hết hạn hoàn thành
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Kiểm tra gói sắp hết hạn hoàn thành"
 *                 data:
 *                   type: object
 *                   properties:
 *                     expiringCount:
 *                       type: number
 *                       description: Số gói sắp hết hạn
 *                     expiringUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           userEmail:
 *                             type: string
 *                           packageName:
 *                             type: string
 *                           endDate:
 *                             type: string
 *                             format: date-time
 *                           daysRemaining:
 *                             type: number
 *                             description: Số ngày còn lại
 *       403:
 *         description: Chỉ admin mới được truy cập
 *       500:
 *         description: Lỗi server
 */
