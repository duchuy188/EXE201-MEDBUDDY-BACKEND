/**
 * @swagger
 * tags:
 *   name: BloodPressure
 *   description: Ghi nhận và quản lý chỉ số huyết áp
 */

/**
 * @swagger
 * /blood-pressure:
 *   post:
 *     summary: Ghi nhận chỉ số huyết áp
 *     tags: [BloodPressure]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BloodPressure'
 *     responses:
 *       201:
 *         description: Đã ghi nhận huyết áp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BloodPressure'
 *   get:
 *     summary: Lấy lịch sử huyết áp
 *     tags: [BloodPressure]
 *     responses:
 *       200:
 *         description: Danh sách lịch sử huyết áp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BloodPressure'
 *
 * /blood-pressure/latest:
 *   get:
 *     summary: Lấy lần đo huyết áp mới nhất
 *     tags: [BloodPressure]
 *     responses:
 *       200:
 *         description: Lần đo mới nhất
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BloodPressure'
 *       404:
 *         description: Không có dữ liệu
 *
 * /blood-pressure/{id}:
 *   delete:
 *     summary: Xóa lần đo huyết áp
 *     tags: [BloodPressure]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID lần đo
 *     responses:
 *       200:
 *         description: Đã xóa lần đo
 *       404:
 *         description: Không tìm thấy lần đo
 */
