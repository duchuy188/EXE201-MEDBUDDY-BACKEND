/**
 * @openapi
 * tags:
 *   - name: Reminders
 *     description: API quản lý nhắc uống thuốc
 * 
 * /api/reminders:
 *   post:
 *     summary: Thêm nhắc uống thuốc mới
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicationId
 *               - reminderType
 *               - time
 *               - startDate
 *               - endDate
 *             properties:
 *               medicationId:
 *                 type: string
 *                 description: ID của thuốc cần nhắc uống
 *                 example: "68a72336cf54f92c3869aa0d"
 *               reminderType:
 *                 type: string
 *                 enum: [normal, voice]
 *                 description: |
 *                   Loại nhắc nhở:
 *                   - normal: Chỉ hiển thị thông báo thông thường (mặc định)
 *                   - voice: Có thêm giọng nói khi thông báo
 *                 default: normal
 *                 example: "normal"
 *               time:
 *                 type: string
 *                 description: Thời gian nhắc nhở (HH:mm)
 *                 example: "08:00"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày bắt đầu nhắc nhở (YYYY-MM-DD)
 *                 example: "2025-09-14"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày kết thúc nhắc nhở (YYYY-MM-DD)
 *                 example: "2025-09-14"
 *               repeat:
 *                 type: string
 *                 enum: [daily, weekly, custom]
 *                 description: Tần suất nhắc nhở
 *                 default: daily
 *                 example: "daily"
 *               note:
 *                 type: string
 *                 description: Ghi chú cho nhắc nhở
 *                 minLength: 3
 *                 maxLength: 5000
 *                 default: "Đã đến giờ uống thuốc rồi"
 *                 example: "Uống thuốc sau bữa sáng"
 *     responses:
 *       201:
 *         description: Tạo nhắc nhở thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 * 
 * components:
 *   schemas:
 *     ReminderTime:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           description: Thời gian nhắc nhở (HH:mm)
 *           example: "08:00"
 *         taken:
 *           type: boolean
 *           description: Đánh dấu đã uống thuốc chưa
 *           default: false
 *           example: false
 *     
 *     Reminder:
 *       type: object
 *       required:
 *         - userId
 *         - medicationId
 *         - time
 *         - startDate
 *         - endDate
 *         - reminderType
 *       properties:
 *         reminderType:
 *           type: string
 *           enum: [normal, voice]
 *           description: |
 *             Loại nhắc nhở:
 *             - normal: Chỉ hiển thị thông báo thông thường (mặc định)
 *             - voice: Có thêm giọng nói khi thông báo
 *           default: normal
 *           example: "normal"
 *         _id:
 *           type: string
 *           description: ID tự động tạo của nhắc nhở
 *           example: "507f1f77bcf86cd799439011"
 *         userId:
 *           type: string
 *           description: ID của người dùng
 *           example: "507f1f77bcf86cd799439012"
 *         medicationId:
 *           type: string
 *           description: ID của thuốc được nhắc
 *           example: "507f1f77bcf86cd799439013"
 *         time:
 *           type: string
 *           description: Thời gian nhắc nhở chính (HH:mm)
 *           example: "08:00"
 *         startDate:
 *           type: string
 *           format: date
 *           description: Ngày bắt đầu nhắc nhở (YYYY-MM-DD)
 *           example: "2025-09-14"
 *         endDate:
 *           type: string
 *           format: date
 *           description: Ngày kết thúc nhắc nhở (YYYY-MM-DD)
 *           example: "2025-12-31"
 *         repeat:
 *           type: string
 *           enum: [daily, weekly, custom]
 *           description: |
 *             Tần suất nhắc nhở:
 *             - daily: Hàng ngày
 *             - weekly: Hàng tuần vào các ngày cụ thể
 *             - custom: Tùy chỉnh thời gian nhắc
 *           default: daily
 *           example: "daily"
 *         repeatDays:
 *           type: array
 *           items:
 *             type: integer
 *             minimum: 0
 *             maximum: 6
 *           description: |
 *             Các ngày lặp lại trong tuần 
 *             - 0: Chủ nhật
 *             - 1: Thứ 2
 *             - 2: Thứ 3
 *             - 3: Thứ 4
 *             - 4: Thứ 5
 *             - 5: Thứ 6
 *             - 6: Thứ 7
 *         repeatTimes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReminderTime'
 *           description: Danh sách các thời điểm nhắc nhở trong ngày
 *         note:
 *           type: string
 *           description: |
 *             Ghi chú cho nhắc nhở:
 *             - Nếu reminderType=normal: Hiển thị như thông báo bình thường
 *             - Nếu reminderType=voice: Sẽ được chuyển thành giọng nói
 *             - Mặc định là "Đã đến giờ uống thuốc rồi" nếu không cung cấp
 *           minLength: 3
 *           maxLength: 5000
 *           default: "Đã đến giờ uống thuốc rồi"
 *           example: "Uống thuốc sau bữa sáng"
 *         voice:
 *           type: string
 *           enum: [banmai, lannhi, leminh, myan, thuminh, giahuy, linhsan]
 *           description: |
 *             Giọng đọc (chỉ áp dụng khi reminderType = voice):
 *             - banmai: Giọng nữ miền Bắc (mặc định)
 *             - lannhi: Giọng nữ miền Nam
 *             - leminh: Giọng nam miền Bắc
 *             - myan: Giọng nữ miền Trung
 *             - thuminh: Giọng nữ miền Bắc (trẻ)
 *             - giahuy: Giọng nam miền Nam
 *             - linhsan: Giọng nữ miền Nam (trẻ)
 *           default: banmai
 *         speed:
 *           type: integer
 *           enum: [-3, -2, -1, 0, 1, 2, 3]
 *           description: |
 *             Tốc độ đọc (chỉ áp dụng khi reminderType = voice):
 *             - -3: Rất chậm
 *             - -2: Chậm
 *             - -1: Hơi chậm
 *             - 0: Bình thường (mặc định)
 *             - 1: Hơi nhanh
 *             - 2: Nhanh
 *             - 3: Rất nhanh
 *           default: 0
 *         audioUrl:
 *           type: string
 *           description: URL của file âm thanh đã tạo
 *         isActive:
 *           type: boolean
 *           description: Trạng thái nhắc nhở
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * security:
 *   - bearerAuth: []
 */

/**
 * @openapi
 * /api/reminders:
 *   get:
 *     summary: Lấy danh sách nhắc uống thuốc của người dùng
 *     tags: [Reminders]
 *     responses:
 *       200:
 *         description: Danh sách nhắc uống thuốc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reminder'
 *   post:
 *     summary: Thêm nhắc uống thuốc mới
 *     tags: [Reminders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicationId
 *               - reminderType
 *               - time
 *               - startDate
 *               - endDate
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID của người dùng (lấy từ token nếu không cung cấp)
 *                 example: "507f1f77bcf86cd799439012"
 *               medicationId:
 *                 type: string
 *                 description: ID của thuốc cần nhắc uống
 *                 example: "507f1f77bcf86cd799439013"
 *               time:
 *                 type: string
 *                 description: Thời gian nhắc nhở (HH:mm)
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày bắt đầu nhắc nhở (YYYY-MM-DD)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày kết thúc nhắc nhở (YYYY-MM-DD)
 *               repeat:
 *                 type: string
 *                 enum: [daily, weekly, custom]
 *                 description: Tần suất nhắc nhở
 *               note:
 *                 type: string
 *                 description: Ghi chú cho nhắc nhở (Nội dung này sẽ được chuyển thành giọng nói. Tối thiểu 3 ký tự, tối đa 5000 ký tự)
 *                 minLength: 3
 *                 maxLength: 5000
 *               voice:
 *                 type: string
 *                 enum: [banmai, lannhi, leminh, myan, thuminh, giahuy, linhsan]
 *                 description: |
 *                   Giọng đọc cho nhắc nhở (FPT.AI TTS API):
 *                   - banmai: Giọng nữ miền Bắc (mặc định)
 *                   - lannhi: Giọng nữ miền Nam
 *                   - leminh: Giọng nam miền Bắc
 *                   - myan: Giọng nữ miền Trung
 *                   - thuminh: Giọng nữ miền Bắc (trẻ)
 *                   - giahuy: Giọng nam miền Nam
 *                   - linhsan: Giọng nữ miền Nam (trẻ)
 *                 default: banmai
 *                 example: "banmai"
 *               speed:
 *                 type: integer
 *                 enum: [-3, -2, -1, 0, 1, 2, 3]
 *                 description: |
 *                   Tốc độ đọc cho giọng nói:
 *                   - -3: Rất chậm
 *                   - -2: Chậm
 *                   - -1: Hơi chậm
 *                   - 0: Bình thường (mặc định)
 *                   - 1: Hơi nhanh
 *                   - 2: Nhanh
 *                   - 3: Rất nhanh
 *                 default: 0
 *                 example: 0
 *     responses:
 *       201:
 *         description: Đã thêm nhắc nhở thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Reminder'
 *                 - type: object
 *                   properties:
 *                     audioUrl:
 *                       type: string
 *                       description: URL của file âm thanh đã được tạo bởi FPT.AI TTS
 *                       example: "https://api.fpt.ai/hmi/tts/v5/download/..."
 *                     message:
 *                       type: string
 *                       example: "Nhắc nhở đã được tạo thành công với âm thanh"
 *       400:
 *         description: Lỗi validation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không thể tạo nhắc nhở"
 *                 error:
 *                   type: string
 *
 * /api/reminders/{id}:
 *   get:
 *     summary: Xem chi tiết nhắc nhở
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
 *         description: Chi tiết nhắc nhở
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reminder'
 *       404:
 *         description: Không tìm thấy nhắc nhở
 *   put:
 *     summary: Cập nhật nhắc nhở
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
 *             properties:
 *               medicationId:
 *                 type: string
 *                 description: ID của thuốc
 *               time:
 *                 type: string
 *                 description: Thời gian nhắc nhở (HH:mm)
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày bắt đầu nhắc nhở (YYYY-MM-DD)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày kết thúc nhắc nhở (YYYY-MM-DD)
 *               repeat:
 *                 type: string
 *                 enum: [daily, weekly, custom]
 *                 description: Tần suất nhắc nhở
 *               note:
 *                 type: string
 *                 description: Ghi chú cho nhắc nhở (Nội dung này sẽ được chuyển thành giọng nói. Tối thiểu 3 ký tự, tối đa 5000 ký tự)
 *                 minLength: 3
 *                 maxLength: 5000
 *               voice:
 *                 type: string
 *                 enum: [banmai, lannhi, leminh, myan, thuminh, giahuy, linhsan]
 *                 description: |
 *                   Giọng đọc cho nhắc nhở (FPT.AI TTS API)
 *                   - banmai: Giọng nữ miền Bắc
 *                   - lannhi: Giọng nữ miền Nam
 *                   - leminh: Giọng nam miền Bắc
 *                   - myan: Giọng nữ miền Trung
 *                   - thuminh: Giọng nữ miền Bắc (trẻ)
 *                   - giahuy: Giọng nam miền Nam
 *                   - linhsan: Giọng nữ miền Nam (trẻ)
 *               speed:
 *                 type: integer
 *                 enum: [-3, -2, -1, 0, 1, 2, 3]
 *                 description: Tốc độ đọc (-3 = chậm nhất, 0 = bình thường, 3 = nhanh nhất)
 *               isActive:
 *                 type: boolean
 *                 description: Trạng thái hoạt động của nhắc nhở
 *     responses:
 *       200:
 *         description: Đã cập nhật nhắc nhở
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Reminder'
 *                 - type: object
 *                   properties:
 *                     audioUrl:
 *                       type: string
 *                       description: URL của file âm thanh mới (sẽ được tạo lại nếu note, voice hoặc speed thay đổi)
 *                       example: "https://api.fpt.ai/hmi/tts/v5/download/..."
 *             example:
 *               message: "Nhắc nhở đã được cập nhật thành công"
 *       400:
 *         description: Lỗi validate dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không thể cập nhật nhắc nhở"
 *                 error:
 *                   type: string
 *       404:
 *         description: Không tìm thấy nhắc nhở
 *   delete:
 *     summary: Xóa nhắc nhở
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
 *         description: Đã xóa nhắc nhở
 *       404:
 *         description: Không tìm thấy nhắc nhở
 * /api/reminders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái nhắc nhở
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, snoozed]
 *                 description: |
 *                   Trạng thái nhắc nhở:
 *                   - pending: Chưa xử lý/đang chờ
 *                   - completed: Đã hoàn thành uống thuốc
 *                   - snoozed: Tạm hoãn, sẽ nhắc lại sau
 *               snoozeTime:
 *                 type: string
 *                 format: date-time
 *                 description: |
 *                   Thời gian nhắc lại nếu chọn "Hãy nhắc tôi sau" (status = snoozed)
 *                   Format: ISO 8601 (ví dụ: 2025-09-14T15:30:00Z)
 *                   Bắt buộc phải có nếu status là "snoozed"
 *     responses:
 *       200:
 *         description: Trạng thái nhắc nhở đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã cập nhật trạng thái nhắc nhở thành công"
 *                 reminder:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Reminder'
 *                     - type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [pending, completed, snoozed]
 *                         snoozeTime:
 *                           type: string
 *                           format: date-time
 *                         audioUrl:
 *                           type: string
 *                           description: URL của file âm thanh (sẽ được phát khi nhắc nhở)
 *             example:
 *               message: "Đã cập nhật trạng thái nhắc nhở thành công"
 *               reminder:
 *                 status: "completed"
 *                 _id: "507f1f77bcf86cd799439011"
 *                 time: "08:00"
 *                 note: "Uống thuốc sau bữa sáng"
 *                 audioUrl: "https://api.fpt.ai/hmi/tts/v5/download/..."
 *       400:
 *         description: Lỗi validate dữ liệu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vui lòng cung cấp thời gian nhắc lại (snoozeTime) khi chọn tạm hoãn"
 *       404:
 *         description: Không tìm thấy nhắc nhở
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ReminderTime:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           description: Thời gian nhắc nhở (HH:mm)
 *           example: "08:00"
 *         taken:
 *           type: boolean
 *           description: Đánh dấu đã uống thuốc chưa
 *           default: false
 *           example: false
 *     
 *     Reminder:
 *       type: object
 *       required:
 *         - userId
 *         - medicationId
 *         - time
 *         - startDate
 *         - endDate
 *         - reminderType
 *       properties:
 *         reminderType:
 *           type: string
 *           enum: [normal, voice]
 *           description: |
 *             Loại nhắc nhở:
 *             - normal: Chỉ hiển thị thông báo thông thường (mặc định)
 *             - voice: Có thêm giọng nói khi thông báo
 *           default: normal
 *           example: "normal"
 *         _id:
 *           type: string
 *           description: ID tự động tạo của nhắc nhở
 *           example: "507f1f77bcf86cd799439011"
 *         userId:
 *           type: string
 *           description: ID của người dùng
 *           example: "507f1f77bcf86cd799439012"
 *         medicationId:
 *           type: string
 *           description: ID của thuốc được nhắc
 *           example: "507f1f77bcf86cd799439013"
 *         time:
 *           type: string
 *           description: Thời gian nhắc nhở chính (HH:mm)
 *           example: "08:00"
 *         startDate:
 *           type: string
 *           format: date
 *           description: Ngày bắt đầu nhắc nhở (YYYY-MM-DD)
 *           example: "2025-09-14"
 *         endDate:
 *           type: string
 *           format: date
 *           description: Ngày kết thúc nhắc nhở (YYYY-MM-DD)
 *           example: "2025-12-31"
 *         repeat:
 *           type: string
 *           enum: [daily, weekly, custom]
 *           description: |
 *             Tần suất nhắc nhở:
 *             - daily: Hàng ngày
 *             - weekly: Hàng tuần vào các ngày cụ thể
 *             - custom: Tùy chỉnh thời gian nhắc
 *           default: daily
 *           example: "weekly"
 *         repeatDays:
 *           type: array
 *           items:
 *             type: integer
 *             minimum: 0
 *             maximum: 6
 *           description: |
 *             Các ngày lặp lại trong tuần 
 *             - 0: Chủ nhật
 *             - 1: Thứ 2
 *             - 2: Thứ 3
 *             - 3: Thứ 4
 *             - 4: Thứ 5
 *             - 5: Thứ 6
 *             - 6: Thứ 7
 *         repeatTimes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 description: Thời gian nhắc nhở (HH:mm)
 *               taken:
 *                 type: boolean
 *                 description: Đánh dấu đã uống thuốc hay chưa
 *                 default: false
 *           description: Danh sách các thời điểm nhắc nhở trong ngày
 *         note:
 *           type: string
 *           description: Ghi chú cho nhắc nhở (Nội dung này sẽ được chuyển thành giọng nói. Tối thiểu 3 ký tự, tối đa 5000 ký tự)
 *           minLength: 3
 *           maxLength: 5000
 *         voice:
 *           type: string
 *           enum: [banmai, lannhi, leminh, myan, thuminh, giahuy, linhsan]
 *           default: banmai
 *           description: |
 *             Giọng đọc cho nhắc nhở (FPT.AI TTS API)
 *             - banmai: Giọng nữ miền Bắc
 *             - lannhi: Giọng nữ miền Nam
 *             - leminh: Giọng nam miền Bắc
 *             - myan: Giọng nữ miền Trung
 *             - thuminh: Giọng nữ miền Bắc (trẻ)
 *             - giahuy: Giọng nam miền Nam
 *             - linhsan: Giọng nữ miền Nam (trẻ)
 *         speed:
 *           type: integer
 *           enum: [-3, -2, -1, 0, 1, 2, 3]
 *           default: 0
 *           description: Tốc độ đọc (-3 đến 3)
 *         audioUrl:
 *           type: string
 *           description: URL của file âm thanh đã tạo
 *         isActive:
 *           type: boolean
 *           description: Trạng thái nhắc nhở
 */
