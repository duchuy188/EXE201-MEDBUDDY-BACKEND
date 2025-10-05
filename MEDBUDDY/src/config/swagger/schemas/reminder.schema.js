/**
 * @swagger
 * components:
 *   schemas:
 *     RepeatTime:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Thời gian nhắc nhở (HH:mm)
 *           example: "08:00"
 *         status:
 *           type: string
 *           enum: [pending, taken, skipped, snoozed, missed]
 *           description: |
 *             Trạng thái lần uống:
 *             - pending: Chưa xử lý
 *             - taken: Đã uống
 *             - skipped: Đã bỏ qua
 *             - snoozed: Đã hoãn 5 phút
 *             - missed: Đã bỏ lỡ (qua ngày)
 *           default: pending
 *           example: "pending"
 *         statusDate:
 *           type: string
 *           format: date
 *           description: Ngày áp dụng trạng thái (YYYY-MM-DD)
 *           example: "2025-10-05"
 *         snoozeUntil:
 *           type: string
 *           format: date-time
 *           description: Thời điểm kết thúc snooze (chỉ khi status = snoozed)
 *           nullable: true
 *           example: "2025-10-05T08:05:00Z"
 *         takenAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm đã uống thuốc (chỉ khi status = taken)
 *           nullable: true
 *           example: "2025-10-05T08:02:00Z"
 *     
 *     Reminder:
 *       type: object
 *       required:
 *         - userId
 *         - medicationId
 *         - reminderType
 *         - times
 *         - startDate
 *         - endDate
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự sinh của nhắc nhở
 *           example: "507f1f77bcf86cd799439011"
 *         userId:
 *           type: string
 *           description: ID người dùng
 *           example: "507f1f77bcf86cd799439012"
 *         medicationId:
 *           type: string
 *           description: ID thuốc
 *           example: "507f1f77bcf86cd799439013"
 *         reminderType:
 *           type: string
 *           enum: [normal, voice]
 *           description: |
 *             Loại nhắc nhở:
 *             - normal: Chỉ hiển thị thông báo thông thường (mặc định)
 *             - voice: Có thêm giọng nói khi thông báo
 *           default: normal
 *           example: "normal"
 *         times:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 enum: ['Sáng', 'Chiều', 'Tối']
 *                 description: Thời điểm trong ngày
 *           description: Các thời điểm nhắc trong ngày
 *           example: [{"time": "Sáng"}, {"time": "Tối"}]
 *         startDate:
 *           type: string
 *           format: date
 *           description: Ngày bắt đầu (YYYY-MM-DD)
 *           example: "2025-10-05"
 *         endDate:
 *           type: string
 *           format: date
 *           description: Ngày kết thúc (YYYY-MM-DD)
 *           example: "2025-12-31"
 *         repeatTimes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RepeatTime'
 *           description: Danh sách các thời điểm nhắc nhở cụ thể với trạng thái per-dose
 *         note:
 *           type: string
 *           description: Ghi chú
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
 *         isActive:
 *           type: boolean
 *           description: Đang bật nhắc nhở
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo
 *         status:
 *           type: string
 *           enum: [pending, completed, snoozed]
 *           description: Trạng thái tổng thể của nhắc nhở (legacy)
 *           default: pending
 *         createdBy:
 *           type: string
 *           description: ID người tạo lịch
 *           nullable: true
 *         createdByType:
 *           type: string
 *           enum: [patient, relative]
 *           description: Loại người tạo
 *           nullable: true
 *       example:
 *         _id: "507f1f77bcf86cd799439011"
 *         userId: "64d1f2c2e1b2a3c4d5e6f7a8"
 *         medicationId: "64d1f2c2e1b2a3c4d5e6f7b9"
 *         reminderType: "normal"
 *         times: [{"time": "Sáng"}]
 *         startDate: "2025-10-05"
 *         endDate: "2025-12-31"
 *         repeatTimes: [
 *           {
 *             "time": "08:00",
 *             "status": "pending",
 *             "statusDate": "2025-10-05"
 *           }
 *         ]
 *         note: "Uống sau khi ăn sáng"
 *         isActive: true
 */
