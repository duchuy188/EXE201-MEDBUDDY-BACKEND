/**
 * @swagger
 * tags:
 *   name: Package
 *   description: Quản lý gói dịch vụ
 */

/**
 * @swagger
 * /api/package/create:
 *   post:
 *     tags: [Package]
 *     summary: Khởi tạo 3 gói dịch vụ mặc định (dùng thử, cơ bản, nâng cao)
 *     description: Tạo 3 gói dịch vụ đúng UI. Chỉ gọi 1 lần khi chưa có gói nào.
 *     responses:
 *       201:
 *         description: Tạo gói dịch vụ thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo gói dịch vụ thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "GÓI HAP DÙNG THỬ"
 *                       price:
 *                         type: number
 *                         example: 0
 *                       duration:
 *                         type: number
 *                         example: 7
 *                       unit:
 *                         type: string
 *                         example: "day"
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *       400:
 *         description: Đã có các gói dịch vụ, không thể tạo lại
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/package:
 *   post:
 *     tags: [Package]
 *     summary: Thêm mới gói dịch vụ (chỉ admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [day, month, year]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Thêm gói dịch vụ thành công
 *       403:
 *         description: Chỉ admin mới được thêm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/package/{id}:
 *   put:
 *     tags: [Package]
 *     summary: Chỉnh sửa thông tin gói dịch vụ (chỉ admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của gói dịch vụ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [day, month, year]
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật gói dịch vụ thành công
 *       403:
 *         description: Chỉ admin mới được chỉnh sửa
 *       404:
 *         description: Không tìm thấy gói dịch vụ
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/package/{id}:
 *   delete:
 *     tags: [Package]
 *     summary: Xóa gói dịch vụ (chỉ admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của gói dịch vụ
 *     responses:
 *       200:
 *         description: Xóa gói dịch vụ thành công
 *       403:
 *         description: Chỉ admin mới được xóa
 *       404:
 *         description: Không tìm thấy gói dịch vụ
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/package:
 *   get:
 *     tags: [Package]
 *     summary: Lấy danh sách tất cả các gói dịch vụ
 *     responses:
 *       200:
 *         description: Danh sách các gói dịch vụ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       duration:
 *                         type: number
 *                       unit:
 *                         type: string
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 *       500:
 *         description: Lỗi server
 */
