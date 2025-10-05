/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Cảnh báo nguy cơ huyết áp cao
 */

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Danh sách cảnh báo (huyết áp cao)
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID người dùng (nếu muốn lọc theo user)
 *     responses:
 *       200:
 *         description: Danh sách cảnh báo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
 *
 * /alerts/acknowledge:
 *   post:
 *     summary: Xác nhận đã đọc cảnh báo
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               alertId:
 *                 type: string
 *                 description: ID cảnh báo
 *     responses:
 *       200:
 *         description: Đã xác nhận cảnh báo
 *       404:
 *         description: Không tìm thấy cảnh báo
 */
