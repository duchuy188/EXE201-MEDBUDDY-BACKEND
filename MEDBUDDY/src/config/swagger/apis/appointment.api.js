/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentCreate:
 *       type: object
 *       required:
 *         - title
 *         - hospital
 *         - date
 *         - time
 *       properties:
 *         title:
 *           type: string
 *           description: Tiêu đề lịch hẹn
 *           example: "Khám định kỳ"
 *         hospital:
 *           type: string
 *           description: Tên bệnh viện
 *           example: "Bệnh viện Chợ Rẫy"
 *         location:
 *           type: string
 *           description: Địa điểm cụ thể
 *           example: "Phòng 305, Khu A"
 *         date:
 *           type: string
 *           format: date
 *           description: Ngày hẹn (YYYY-MM-DD)
 *           example: "2025-09-20"
 *         time:
 *           type: string
 *           description: Thời gian hẹn (HH:mm)
 *           example: "09:30"
 *         notes:
 *           type: string
 *           description: Ghi chú thêm
 *           example: "Nhớ mang theo sổ khám bệnh"
 *     Appointment:
 *       allOf:
 *         - $ref: '#/components/schemas/AppointmentCreate'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: ID của lịch hẹn
 *             status:
 *               type: string
 *               enum: [pending, completed, cancelled]
 *               default: pending
 *               description: Trạng thái lịch hẹn
 *             userId:
 *               type: string
 *               description: ID của người dùng tạo lịch hẹn
 *             createdAt:
 *               type: string
 *               format: date-time
 *               description: Thời gian tạo
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               description: Thời gian cập nhật gần nhất
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Tạo lịch hẹn tái khám mới
 *     description: Tạo một lịch hẹn tái khám mới. Sau khi tạo, hệ thống sẽ tự động gửi thông báo cho người dùng.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentCreate'
 *           example:
 *             title: "Khám định kỳ"
 *             hospital: "Bệnh viện Chợ Rẫy"
 *             location: "Phòng 305, Khu A"
 *             date: "2025-09-20"
 *             time: "09:30"
 *             notes: "Nhớ mang theo sổ khám bệnh"
 *     responses:
 *       201:
 *         description: Tạo lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *             example:
 *               success: true
 *               data:
 *                 _id: "650c1234b789f12345678901"
 *                 title: "Khám định kỳ"
 *                 hospital: "Bệnh viện Chợ Rẫy"
 *                 location: "Phòng 305, Khu A"
 *                 date: "2025-09-20"
 *                 time: "09:30"
 *                 notes: "Nhớ mang theo sổ khám bệnh"
 *                 status: "pending"
 *                 userId: "650c0000b789f12345678900"
 *                 createdAt: "2025-09-14T08:00:00.000Z"
 *                 updatedAt: "2025-09-14T08:00:00.000Z"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Ngày hẹn không hợp lệ"
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Không có quyền truy cập"
 *   get:
 *     tags: [Appointments]
 *     summary: Lấy danh sách tất cả lịch hẹn
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 * 
 * /api/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Lấy thông tin chi tiết một lịch hẹn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     responses:
 *       200:
 *         description: Lấy thông tin lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *   put:
 *     tags: [Appointments]
 *     summary: Cập nhật thông tin lịch hẹn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentCreate'
 *     responses:
 *       200:
 *         description: Cập nhật lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *   delete:
 *     tags: [Appointments]
 *     summary: Xóa lịch hẹn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     responses:
 *       200:
 *         description: Xóa lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 */

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Lấy danh sách tất cả lịch hẹn
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 * 
 * /api/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Lấy thông tin chi tiết một lịch hẹn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     responses:
 *       200:
 *         description: Lấy thông tin lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *   put:
 *     tags: [Appointments]
 *     summary: Cập nhật thông tin lịch hẹn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       200:
 *         description: Cập nhật lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *   delete:
 *     tags: [Appointments]
 *     summary: Xóa lịch hẹn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch hẹn
 *     responses:
 *       200:
 *         description: Xóa lịch hẹn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 */
