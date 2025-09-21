/**
 * @swagger
 * /relative-patient/confirm:
 *   post:
 *     tags: [RelativePatient]
 *     summary: Xác nhận liên kết bằng mã OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               linkId:
 *                 type: string
 *                 example: "6510b2e2c8a1f2b1a1a1a1"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác nhận liên kết thành công
 *       400:
 *         description: Mã OTP không đúng hoặc đã hết hạn
 *       404:
 *         description: Không tìm thấy liên kết
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * tags:
 *   name: RelativePatient
 *   description: Quản lý liên kết người thân-người bệnh
 */

/**
 * @swagger
 * /relative-patient/add:
 *   post:
 *     tags: [RelativePatient]
 *     summary: Người bệnh thêm người thân vào danh sách theo dõi
 *     description: Chỉ người bệnh (role=patient) mới có thể thêm người thân (role=relative)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "relative@example.com"
 *     responses:
 *       201:
 *         description: Đã gửi mã OTP xác nhận tới email người thân
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã gửi mã OTP xác nhận tới email người thân"
 *                 linkId:
 *                   type: string
 *                   example: "6510b2e2c8a1f2b1a1a1a1a1"
 *       400:
 *         description: Email không hợp lệ hoặc đã tồn tại liên kết
 *       403:
 *         description: Không có quyền thực hiện (chỉ patient mới được thêm relative)
 *       404:
 *         description: Không tìm thấy người thân với email này
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients:
 *   get:
 *     tags: [RelativePatient]
 *     summary: Lấy danh sách người bệnh của người thân
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người bệnh
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/relatives:
 *   get:
 *     tags: [RelativePatient]
 *     summary: Lấy danh sách người thân của người bệnh
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người thân
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/delete:
 *   post:
 *     tags: [RelativePatient]
 *     summary: Xóa liên kết giữa người bệnh và người thân
 *     description: Chỉ người bệnh hoặc người thân liên quan mới được xóa liên kết
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               linkId:
 *                 type: string
 *                 example: "6510b2e2c8a1f2b1a1a1a1a1"
 *             required:
 *               - linkId
 *     responses:
 *       200:
 *         description: Xóa liên kết thành công
 *       403:
 *         description: Không có quyền xóa liên kết này
 *       404:
 *         description: Không tìm thấy liên kết
 *       500:
 *         description: Lỗi server
 */
