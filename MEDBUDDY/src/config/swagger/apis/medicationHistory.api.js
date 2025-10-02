/**
 * @swagger
 * /medicationsHistory:
 *   post:
 *     summary: Tạo lịch sử uống thuốc mới
 *     tags: [MedicationHistory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationHistory'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationHistory'
 *       500:
 *         description: Lỗi server
 *
 * /medicationsHistory/user/{userId}:
 *   get:
 *     summary: Lấy lịch sử uống thuốc theo user
 *     tags: [MedicationHistory]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Danh sách lịch sử uống thuốc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MedicationHistory'
 *       500:
 *         description: Lỗi server
 *
 * /medicationsHistory/{id}:
 *   put:
 *     summary: Cập nhật trạng thái uống thuốc
 *     tags: [MedicationHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lịch sử
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationHistory'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationHistory'
 *       404:
 *         description: Không tìm thấy
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa lịch sử uống thuốc
 *     tags: [MedicationHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lịch sử
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deleted
 *       404:
 *         description: Không tìm thấy
 *       500:
 *         description: Lỗi server
 */