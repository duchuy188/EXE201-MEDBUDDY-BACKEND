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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên thuốc
 *               form:
 *                 type: string
 *                 description: Dạng thuốc
 *               note:
 *                 type: string
 *                 description: Ghi chú
 *               totalQuantity:
 *                 type: number
 *                 description: Tổng số lượng ban đầu
 *               lowStockThreshold:
 *                 type: number
 *                 description: Ngưỡng cảnh báo (mặc định 5)
 *               times:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: string
 *                       enum: [Sáng, Chiều, Tối]
 *                     dosage:
 *                       type: string
 *     responses:
 *       201:
 *         description: Đã thêm thuốc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *
 * /medications/low-stock:
 *   get:
 *     summary: Lấy danh sách thuốc sắp hết
 *     tags: [Medications]
 *     responses:
 *       200:
 *         description: Danh sách thuốc sắp hết
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *       500:
 *         description: Lỗi server
 *
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
 *     summary: Cập nhật thông tin thuốc (gộp update + mua thêm + đặt ngưỡng)
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên thuốc
 *               form:
 *                 type: string
 *                 description: Dạng thuốc
 *               image:
 *                 type: string
 *                 description: Ảnh thuốc
 *               note:
 *                 type: string
 *                 description: Ghi chú
 *               times:
 *                 type: array
 *                 description: Thời gian uống thuốc
 *                 items:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: string
 *                       enum: [Sáng, Chiều, Tối]
 *                     dosage:
 *                       type: string
 *               quantity:
 *                 type: string
 *                 description: Mô tả số lượng (tương thích cũ)
 *               addedQuantity:
 *                 type: number
 *                 description: Số lượng thuốc thêm vào (mua thêm)
 *                 example: 10
 *               lowStockThreshold:
 *                 type: number
 *                 description: Ngưỡng cảnh báo (số viên)
 *                 example: 5
 *           examples:
 *             updateBasicInfo:
 *               summary: Chỉ cập nhật thông tin cơ bản
 *               value:
 *                 name: "Paracetamol 500mg"
 *                 note: "Uống sau ăn"
 *             addStock:
 *               summary: Chỉ mua thêm thuốc
 *               value:
 *                 addedQuantity: 10
 *             updateThreshold:
 *               summary: Chỉ đặt ngưỡng cảnh báo
 *               value:
 *                 lowStockThreshold: 8
 *             updateAll:
 *               summary: Cập nhật tất cả cùng lúc
 *               value:
 *                 name: "Paracetamol 500mg Updated"
 *                 note: "Uống sau ăn, tránh đói"
 *                 addedQuantity: 5
 *                 lowStockThreshold: 10
 *     responses:
 *       200:
 *         description: Cập nhật thuốc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Medication'
 *                 addedQuantity:
 *                   type: number
 *                   description: Số lượng đã thêm (chỉ có khi mua thêm)
 *                 remainingQuantity:
 *                   type: number
 *                   description: Số lượng còn lại sau khi thêm
 *                 totalQuantity:
 *                   type: number
 *                   description: Tổng số lượng sau khi thêm
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