/**
 * @swagger
 * /api/medications-history:
 *   post:
 *     summary: Tạo lịch sử uống thuốc mới
 *     tags: [MedicationHistory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationHistory'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationHistory'
 *       500:
 *         description: Lỗi server
 *
 * /api/medications-history/user/{userId}:
 *   get:
 *     summary: Lấy lịch sử uống thuốc theo user
 *     tags: [MedicationHistory]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Danh sách lịch sử uống thuốc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MedicationHistory'
 *       500:
 *         description: Lỗi server
 *
 * /api/medications-history/user/{userId}/weekly:
 *   get:
 *     summary: Lấy tổng quan tuần uống thuốc (như trong app)
 *     tags: [MedicationHistory]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu tuần (YYYY-MM-DD). Nếu không có sẽ lấy tuần hiện tại
 *         example: "2025-10-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc tuần (YYYY-MM-DD). Nếu không có sẽ lấy tuần hiện tại  
 *         example: "2025-10-07"
 *     responses:
 *       200:
 *         description: Tổng quan tuần uống thuốc với thống kê chi tiết
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WeeklyOverview'
 *             examples:
 *               weekly_overview:
 *                 summary: Ví dụ tổng quan tuần
 *                 value:
 *                   period:
 *                     startDate: "2025-10-01"
 *                     endDate: "2025-10-07"
 *                     totalDays: 7
 *                   medications:
 *                     - medicationId: "507f1f77bcf86cd799439011"
 *                       medicationName: "Amlodipine 5mg"
 *                       dosage: "5mg"
 *                       note: "Sáng 7:00"
 *                       weeklyStats:
 *                         totalDoses: 7
 *                         takenOnTime: 6
 *                         takenLate: 1
 *                         missed: 0
 *                         skipped: 0
 *                         adherenceRate: 95
 *                       dailyBreakdown:
 *                         T2: { taken: 1, missed: 0 }
 *                         T3: { taken: 1, missed: 0 }
 *                         T4: { taken: 0, missed: 1 }
 *                         T5: { taken: 1, missed: 0 }
 *                         T6: { taken: 1, missed: 0 }
 *                         T7: { taken: 1, missed: 0 }
 *                         CN: { taken: 1, missed: 0 }
 *                     - medicationId: "507f1f77bcf86cd799439012"
 *                       medicationName: "Candesartan 8mg"
 *                       dosage: "8mg"
 *                       note: "Tối 19:00"
 *                       weeklyStats:
 *                         totalDoses: 7
 *                         takenOnTime: 5
 *                         takenLate: 1
 *                         missed: 0
 *                         skipped: 1
 *                         adherenceRate: 86
 *                       dailyBreakdown:
 *                         T2: { taken: 1, missed: 0 }
 *                         T3: { taken: 1, missed: 0 }
 *                         T4: { taken: 1, missed: 0 }
 *                         T5: { taken: 1, missed: 0 }
 *                         T6: { taken: 1, missed: 0 }
 *                         T7: { taken: 1, missed: 0 }
 *                         CN: { taken: 0, missed: 1 }
 *                   summary:
 *                     totalMedications: 2
 *                     averageAdherence: 90.5
 *       500:
 *         description: Lỗi server
 *
 * /api/medications-history/user/{userId}/overview:
 *   get:
 *     summary: Lấy tất cả lịch sử uống thuốc với thống kê tổng quan
 *     tags: [MedicationHistory]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID người dùng
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Số lượng records tối đa trả về
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Vị trí bắt đầu (để phân trang)
 *     responses:
 *       200:
 *         description: Tất cả lịch sử uống thuốc với thống kê
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MedicationHistory'
 *                   description: Danh sách lịch sử (mới nhất trước)
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 250
 *                     limit:
 *                       type: integer
 *                       example: 100
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     hasMore:
 *                       type: boolean
 *                       example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 250
 *                       description: Tổng số lần uống
 *                     pending:
 *                       type: integer
 *                       example: 5
 *                     on_time:
 *                       type: integer
 *                       example: 200
 *                     late:
 *                       type: integer
 *                       example: 30
 *                     missed:
 *                       type: integer
 *                       example: 10
 *                     skipped:
 *                       type: integer
 *                       example: 5
 *                     snoozed:
 *                       type: integer
 *                       example: 0
 *                 adherenceRate:
 *                   type: integer
 *                   example: 92
 *                   description: Tỷ lệ tuân thủ tổng (%)
 *                 medicationGroups:
 *                   type: array
 *                   description: Nhóm theo từng loại thuốc
 *                   items:
 *                     type: object
 *                     properties:
 *                       medicationId:
 *                         type: string
 *                       medicationName:
 *                         type: string
 *                         example: "Paracetamol 500mg"
 *                       dosage:
 *                         type: string
 *                         example: "500mg"
 *                       note:
 *                         type: string
 *                         example: "Uống sau khi ăn"
 *                       histories:
 *                         type: array
 *                         description: Lịch sử của thuốc này
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             date:
 *                               type: string
 *                               example: "2025-10-05"
 *                             time:
 *                               type: string
 *                               example: "08:00"
 *                             status:
 *                               type: string
 *                               example: "on_time"
 *                             taken:
 *                               type: boolean
 *                               example: true
 *             examples:
 *               full_overview:
 *                 summary: Ví dụ tổng quan đầy đủ
 *                 value:
 *                   data: []
 *                   pagination:
 *                     total: 250
 *                     limit: 100
 *                     offset: 0
 *                     hasMore: true
 *                   stats:
 *                     total: 250
 *                     pending: 5
 *                     on_time: 200
 *                     late: 30
 *                     missed: 10
 *                     skipped: 5
 *                     snoozed: 0
 *                   adherenceRate: 92
 *                   medicationGroups:
 *                     - medicationId: "507f1f77bcf86cd799439011"
 *                       medicationName: "Paracetamol 500mg"
 *                       dosage: "500mg"
 *                       note: "Uống sau khi ăn"
 *                       histories:
 *                         - id: "507f1f77bcf86cd799439021"
 *                           date: "2025-10-05"
 *                           time: "08:00"
 *                           status: "on_time"
 *                           taken: true
 *                           takenAt: "2025-10-05T01:05:00.000Z"
 *       500:
 *         description: Lỗi server
 *
 * /api/medications-history/{id}:
 *   put:
 *     summary: Cập nhật trạng thái uống thuốc
 *     tags: [MedicationHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lịch sử
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicationHistory'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationHistory'
 *       404:
 *         description: Không tìm thấy
 *       500:
 *         description: Lỗi server
 *   delete:
 *     summary: Xóa lịch sử uống thuốc
 *     tags: [MedicationHistory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID lịch sử
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deleted
 *       404:
 *         description: Không tìm thấy
 *       500:
 *         description: Lỗi server
 */