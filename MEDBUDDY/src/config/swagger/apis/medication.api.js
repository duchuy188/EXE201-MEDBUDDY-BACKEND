/**
 * @swagger
 * /medications/from-ocr:
 *   post:
 *     summary: Lưu nhiều thuốc từ kết quả OCR
 *     tags: [Medications]
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
 *               medicines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: string
 *                     form:
 *                       type: string
 *                     usage:
 *                       type: string
 *               imageUrl:
 *                 type: string
 *                 description: URL ảnh đơn thuốc
 *               rawText:
 *                 type: string
 *                 description: Văn bản OCR gốc
 *     responses:
 *       201:
 *         description: Danh sách thuốc đã lưu
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
/**
 * @swagger
 * tags:
 *   name: Medications
 *   description: Quản lý thuốc cho nhắc nhở cao huyết áp
 */

/**
 * @swagger
 * /medications:
 *   get:
 *     summary: Lấy danh sách thuốc của người dùng
 *     tags: [Medications]
 *     responses:
 *       200:
 *         description: Danh sách thuốc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *   post:
 *     summary: Thêm thuốc mới
 *     tags: [Medications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medication'
 *     responses:
 *       201:
 *         description: Đã thêm thuốc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *
 * /medications/{id}:
 *   get:
 *     summary: Xem chi tiết thuốc
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID thuốc
 *     responses:
 *       200:
 *         description: Chi tiết thuốc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       404:
 *         description: Không tìm thấy thuốc
 *   put:
 *     summary: Cập nhật thông tin thuốc
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID thuốc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medication'
 *     responses:
 *       200:
 *         description: Đã cập nhật thuốc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       404:
 *         description: Không tìm thấy thuốc
 *   delete:
 *     summary: Xóa thuốc
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID thuốc
 *     responses:
 *       200:
 *         description: Đã xóa thuốc
 *       404:
 *         description: Không tìm thấy thuốc
 */
