/**
 * @openapi
 * tags:
 *   - name: Reminders
 *     description: API quản lý nhắc uống thuốc với hỗ trợ per-dose actions
 * 
 * /api/reminders:
 *   get:
 *     summary: Lấy danh sách nhắc uống thuốc của người dùng
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách nhắc uống thuốc
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *         
 *   post:
 *     summary: Thêm nhắc uống thuốc mới
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tạo nhắc nhở thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 * 
 * /api/reminders/{id}:
 *   get:
 *     summary: Xem chi tiết nhắc nhở
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
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
 *       404:
 *         description: Không tìm thấy nhắc nhở
 * 
 * /api/reminders/{id}/status:
 *   get:
 *     summary: Xem trạng thái các lần uống thuốc hôm nay
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
 *         description: Trạng thái chi tiết các lần uống hôm nay
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reminder:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     medicationName:
 *                       type: string
 *                       example: "Paracetamol 500mg"
 *                     note:
 *                       type: string
 *                       example: "Uống sau khi ăn"
 *                 date:
 *                   type: string
 *                   format: date
 *                   example: "2025-10-05"
 *                 totalTimes:
 *                   type: integer
 *                   description: Tổng số lần uống trong ngày
 *                   example: 3
 *                 completed:
 *                   type: integer
 *                   description: Số lần đã uống
 *                   example: 1
 *                 pending:
 *                   type: integer
 *                   description: Số lần chưa xử lý
 *                   example: 1
 *                 skipped:
 *                   type: integer
 *                   description: Số lần bỏ qua
 *                   example: 1
 *                 snoozed:
 *                   type: integer
 *                   description: Số lần đang hoãn
 *                   example: 0
 *                 statusDetails:
 *                   type: array
 *                   description: Chi tiết trạng thái từng lần uống
 *                   items:
 *                     type: object
 *                     properties:
 *                       time:
 *                         type: string
 *                         example: "08:00"
 *                       status:
 *                         type: string
 *                         enum: [pending, on_time, late, missed, skipped, snoozed]
 *                         example: "on_time"
 *                       taken:
 *                         type: boolean
 *                         example: true
 *                       canTake:
 *                         type: boolean
 *                         description: Có thể đánh dấu uống không
 *                         example: false
 *                       canSkip:
 *                         type: boolean
 *                         description: Có thể bỏ qua không
 *                         example: false
 *                       canSnooze:
 *                         type: boolean
 *                         description: Có thể hoãn không
 *                         example: false
 *       404:
 *         description: Không tìm thấy nhắc nhở
 *   
 *   patch:
 *     summary: Cập nhật trạng thái lần uống cụ thể (take/skip/snooze)
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
 *             type: object
 *             required:
 *               - action
 *               - time
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [take, skip, snooze]
 *                 description: |
 *                   Hành động cho lần uống:
 *                   - take: Đánh dấu đã uống thuốc
 *                   - skip: Bỏ qua lần uống này
 *                   - snooze: Hoãn 5 phút
 *                 example: "take"
 *               time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Thời gian lần uống cần cập nhật (HH:mm)
 *                 example: "08:00"
 *           examples:
 *             take_medication:
 *               summary: Đánh dấu đã uống thuốc
 *               value:
 *                 action: "take"
 *                 time: "08:00"
 *             skip_medication:
 *               summary: Bỏ qua lần uống
 *               value:
 *                 action: "skip"
 *                 time: "08:00"
 *             snooze_medication:
 *               summary: Hoãn 5 phút
 *               value:
 *                 action: "snooze"
 *                 time: "08:00"
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái lần uống thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã đánh dấu uống lần uống 08:00"
 *                 history:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       example: "2025-10-05"
 *                     time:
 *                       type: string
 *                       example: "08:00"
 *                     status:
 *                       type: string
 *                       example: "on_time"
 *                     taken:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Lỗi validate dữ liệu hoặc ràng buộc nghiệp vụ
 *       404:
 *         description: Không tìm thấy nhắc nhở
 */