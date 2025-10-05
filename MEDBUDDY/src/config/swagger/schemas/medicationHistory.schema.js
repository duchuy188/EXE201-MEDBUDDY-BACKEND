/**
 * @swagger
 * components:
 *   schemas:
 *     MedicationHistory:
 *       type: object
 *       required:
 *         - userId
 *         - medicationId
 *         - reminderId
 *         - date
 *         - time
 *       properties:
 *         userId:
 *           type: string
 *           description: ID người dùng
 *         medicationId:
 *           type: string
 *           description: ID thuốc
 *         reminderId:
 *           type: string
 *           description: ID nhắc nhở
 *         date:
 *           type: string
 *           example: '2025-10-01'
 *           description: Ngày uống thuốc (YYYY-MM-DD)
 *         time:
 *           type: string
 *           example: '08:00'
 *           description: Giờ uống thuốc (HH:mm)
 *         taken:
 *           type: boolean
 *           default: false
 *           description: Đã uống chưa
 *         takenAt:
 *           type: string
 *           format: date-time
 *           description: Thời điểm xác nhận uống
 *         status:
 *           type: string
 *           enum: [pending, on_time, late, missed, skipped, snoozed]
 *           default: pending
 *           description: |
 *             Trạng thái uống thuốc:
 *             - pending: Chưa xử lý
 *             - on_time: Đã uống đúng giờ  
 *             - late: Đã uống nhưng trễ
 *             - missed: Bỏ lỡ (qua ngày)
 *             - skipped: Bỏ qua có ý thức
 *             - snoozed: Đang hoãn
 *         snoozeUntil:
 *           type: string
 *           format: date-time
 *           description: Thời điểm kết thúc hoãn
 *         snoozeCount:
 *           type: number
 *           default: 0
 *           description: Số lần đã hoãn
 *
 *     WeeklyOverview:
 *       type: object
 *       properties:
 *         period:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *               example: "2025-10-01"
 *             endDate:
 *               type: string
 *               format: date
 *               example: "2025-10-07"
 *         medications:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               medicationName:
 *                 type: string
 *                 example: "Amlodipine 5mg"
 *               weeklyStats:
 *                 type: object
 *                 properties:
 *                   totalDoses:
 *                     type: integer
 *                     example: 7
 *                   adherenceRate:
 *                     type: integer
 *                     example: 95
 *                     description: "Tỷ lệ tuân thủ (%)"
 *               dailyBreakdown:
 *                 type: object
 *                 description: "Thống kê theo ngày T2-CN"
 *                 example:
 *                   T2: { taken: 2, missed: 0 }
 *                   T3: { taken: 2, missed: 0 }
 *                   T4: { taken: 1, missed: 1 }
 *         summary:
 *           type: object
 *           properties:
 *             totalMedications:
 *               type: integer
 *               example: 2
 *             averageAdherence:
 *               type: number
 *               example: 90.5
 */
