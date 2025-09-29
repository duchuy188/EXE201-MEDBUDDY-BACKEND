/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gửi và quản lý thông báo Firebase cho nhắc uống thuốc
 */

/**
 * @swagger
 * /notifications/token:
 *   post:
 *     summary: Lưu token thiết bị nhận thông báo
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID người dùng
 *               deviceToken:
 *                 type: string
 *                 description: Token thiết bị Firebase
 *     responses:
 *       201:
 *         description: Đã lưu token
 *
 * /notifications/send:
 *   post:
 *     summary: Gửi thông báo nhắc uống thuốc qua Firebase
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID người dùng
 *               title:
 *                 type: string
 *                 description: Tiêu đề thông báo
 *               body:
 *                 type: string
 *                 description: Nội dung thông báo
 *     responses:
 *       200:
 *         description: Đã gửi thông báo
 *
 * /notifications/delete-token:
 *   post:
 *     summary: Xóa token thiết bị khi logout
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID người dùng
 *               deviceToken:
 *                 type: string
 *                 description: Token thiết bị cần xóa
 *     responses:
 *       200:
 *         description: Đã xóa token

 * /notifications/history:
 *   get:
 *     summary: Lấy lịch sử thông báo đã gửi
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID người dùng (nếu muốn lọc theo user)
 *     responses:
 *       200:
 *         description: Danh sách lịch sử thông báo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationHistory'
 */
