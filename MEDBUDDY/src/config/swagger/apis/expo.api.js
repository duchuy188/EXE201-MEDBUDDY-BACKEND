/**
 * @swagger
 * /test-expo:
 *   post:
 *     summary: Test gửi notification qua Expo
 *     tags:
 *       - Notification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Expo Push Token
 *               title:
 *                 type: string
 *                 description: Tiêu đề thông báo
 *               body:
 *                 type: string
 *                 description: Nội dung thông báo
 *               data:
 *                 type: object
 *                 description: Dữ liệu bổ sung
 *     responses:
 *       200:
 *         description: Notification sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: Kết quả trả về từ Expo
 *       500:
 *         description: Lỗi gửi notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Thông báo lỗi
 */
