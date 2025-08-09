/**
 * @swagger
 * tags:
 *   name: Reminders
 *   description: Quản lý nhắc uống thuốc cho người bệnh
 */

/**
 * @swagger
 * /reminders:
 *   get:
 *     summary: Lấy danh sách nhắc uống thuốc của người dùng
 *     tags: [Reminders]
 *     responses:
 *       200:
 *         description: Danh sách nhắc uống thuốc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reminder'
 *   post:
 *     summary: Thêm nhắc uống thuốc mới
 *     tags: [Reminders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reminder'
 *     responses:
 *       201:
 *         description: Đã thêm nhắc nhở
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reminder'
 *
 * /reminders/{id}:
 *   get:
 *     summary: Xem chi tiết nhắc nhở
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID nhắc nhở
 *     responses:
 *       200:
 *         description: Chi tiết nhắc nhở
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reminder'
 *       404:
 *         description: Không tìm thấy nhắc nhở
 *   put:
 *     summary: Cập nhật nhắc nhở
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID nhắc nhở
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reminder'
 *     responses:
 *       200:
 *         description: Đã cập nhật nhắc nhở
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reminder'
 *       404:
 *         description: Không tìm thấy nhắc nhở
 *   delete:
 *     summary: Xóa nhắc nhở
 *     tags: [Reminders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID nhắc nhở
 *     responses:
 *       200:
 *         description: Đã xóa nhắc nhở
 *       404:
 *         description: Không tìm thấy nhắc nhở
 */
