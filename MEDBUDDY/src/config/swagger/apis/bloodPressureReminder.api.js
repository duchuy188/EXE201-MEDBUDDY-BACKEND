/**
 * @swagger
 * tags:
 *   name: BloodPressureReminder
 *   description: Quản lý nhắc đo huyết áp
 */

/**
 * @swagger
 * /blood-pressure-reminder:
 *   get:
 *     summary: Lấy danh sách nhắc đo huyết áp của user
 *     tags: [BloodPressureReminder]
 *     responses:
 *       200:
 *         description: Danh sách nhắc đo huyết áp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BloodPressureReminder'
 *   post:
 *     summary: Tạo nhắc đo huyết áp
 *     tags: [BloodPressureReminder]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BloodPressureReminder'
 *     responses:
 *       201:
 *         description: Đã tạo nhắc đo huyết áp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BloodPressureReminder'
 *
 * /blood-pressure-reminder/{id}:
 *   get:
 *     summary: Xem chi tiết nhắc đo huyết áp
 *     tags: [BloodPressureReminder]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID nhắc đo huyết áp
 *     responses:
 *       200:
 *         description: Chi tiết nhắc đo huyết áp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BloodPressureReminder'
 *   put:
 *     summary: Cập nhật nhắc đo huyết áp
 *     tags: [BloodPressureReminder]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID nhắc đo huyết áp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BloodPressureReminder'
 *     responses:
 *       200:
 *         description: Đã cập nhật nhắc đo huyết áp
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BloodPressureReminder'
 *   delete:
 *     summary: Xóa nhắc đo huyết áp
 *     tags: [BloodPressureReminder]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID nhắc đo huyết áp
 *     responses:
 *       200:
 *         description: Đã xóa nhắc đo huyết áp
 */
