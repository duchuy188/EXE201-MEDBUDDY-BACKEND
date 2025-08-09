/**
 * @swagger
 * tags:
 *   name: MedicationHistory
 *   description: Theo dõi việc uống thuốc
 */

/**
 * @swagger
 * /medications/history:
 *   post:
 *     summary: Ghi nhận đã uống thuốc/đã bỏ quên
 *     tags: [MedicationHistory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationHistory'
 *     responses:
 *       201:
 *         description: Đã ghi nhận lịch sử
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationHistory'
 *   get:
 *     summary: Xem lại lịch sử uống thuốc
 *     tags: [MedicationHistory]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID người dùng (nếu muốn lọc theo user)
 *     responses:
 *       200:
 *         description: Danh sách lịch sử uống thuốc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MedicationHistory'
 */
