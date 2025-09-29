/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phoneNumber
 *         - password
 *         - role
 *         - dateOfBirth
 *       properties:
 *         fullName:
 *           type: string
 *           example: "Nguyễn Văn A"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         phoneNumber:
 *           type: string
 *           example: "0123456789"
 *         password:
 *           type: string
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [relative, patient, admin]
 *           example: "patient"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *     
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           example: "Nguyễn Văn A"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         phoneNumber:
 *           type: string
 *           example: "0123456789"
 *         role:
 *           type: string
 *           enum: [relative, patient, admin]
 *           example: "patient"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         isBlocked:
 *           type: boolean
 *           example: false
 *     
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         fullName:
 *           type: string
 *           example: "Nguyễn Văn A"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         phoneNumber:
 *           type: string
 *           example: "0123456789"
 *         role:
 *           type: string
 *           example: "patient"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         avatar:
 *           type: string
 *           example: "https://example.com/avatar.jpg"
 *         isBlocked:
 *           type: boolean
 *           example: false
 *         blockedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         blockedBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *             fullName:
 *               type: string
 *               example: "Admin User"
 *             email:
 *               type: string
 *               example: "admin@example.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T00:00:00.000Z"
 *     
 *     UsersListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Danh sách người dùng"
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserResponse'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: number
 *               example: 1
 *             totalPages:
 *               type: number
 *               example: 5
 *             totalUsers:
 *               type: number
 *               example: 50
 *             hasNext:
 *               type: boolean
 *               example: true
 *             hasPrev:
 *               type: boolean
 *               example: false
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Dashboard admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin dashboard admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xin chào Admin Nguyễn Văn A"
 *                 role:
 *                   type: string
 *                   example: "admin"
 *       401:
 *         description: Token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lấy danh sách người dùng (có phân trang và filter)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng user mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên, email, số điện thoại
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [relative, patient, admin]
 *         description: Lọc theo role
 *       - in: query
 *         name: isBlocked
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái block
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersListResponse'
 *       401:
 *         description: Token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Thông tin người dùng"
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Tạo người dùng mới
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Tạo người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tạo người dùng thành công"
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Thông tin không hợp lệ hoặc email/số điện thoại đã tồn tại
 *       401:
 *         description: Token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Cập nhật người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật người dùng thành công"
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Thông tin không hợp lệ hoặc không thể block chính mình
 *       401:
 *         description: Token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/admin/users/{id}/block:
 *   patch:
 *     summary: Chặn người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Chặn người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Block người dùng thành công"
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Không thể block chính mình hoặc người dùng đã bị block
 *       401:
 *         description: Token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /api/admin/users/{id}/unblock:
 *   patch:
 *     summary: Bỏ chặn người dùng
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Bỏ chặn người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unblock người dùng thành công"
 *                 user:
 *                   $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Người dùng chưa bị block
 *       401:
 *         description: Token không hợp lệ
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
