/**
 * @swagger
 * tags:
 *   name: Blood Pressure AI
 *   description: AI-powered blood pressure analysis and recommendations
 */

/**
 * @swagger
 * /api/blood-pressure/ai/analyze:
 *   post:
 *     tags:
 *       - Blood Pressure AI
 *     summary: Phân tích BP gần nhất với Gemini AI
 *     description: Tự động phân tích chỉ số huyết áp gần nhất của user với Gemini AI (không cần truyền bloodPressureId)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Phân tích AI thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Phân tích AI thành công"
 *                 data:
 *                   $ref: '#/components/schemas/AIAnalysisCard'
 *       404:
 *         description: Không tìm thấy dữ liệu huyết áp để phân tích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy dữ liệu huyết áp gần đây"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi server khi phân tích huyết áp với AI"

 */

/**
 * @swagger
 * /api/blood-pressure/ai/analyze-specific/{bloodPressureId}:
 *   post:
 *     tags:
 *       - Blood Pressure AI
 *     summary: Phân tích BP cụ thể với Gemini AI
 *     description: Phân tích một bản ghi huyết áp cụ thể bằng Gemini AI (cần truyền bloodPressureId)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bloodPressureId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bản ghi huyết áp cần phân tích
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Phân tích AI thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Phân tích AI thành công"
 *                 data:
 *                   $ref: '#/components/schemas/AIAnalysisCard'
 *       404:
 *         description: Không tìm thấy dữ liệu huyết áp để phân tích
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy dữ liệu huyết áp"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi server khi phân tích huyết áp với AI"

 */


/**
 * @swagger
 * /api/blood-pressure/ai/insights/{userId}:
 *   get:
 *     tags:
 *       - Blood Pressure AI
 *     summary: Lấy AI insights tổng hợp của user
 *     description: Lấy tổng hợp các phân tích AI và insights cho một user cụ thể (user chỉ có thể xem insights của chính mình)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Số lượng insights muốn lấy
 *     responses:
 *       200:
 *         description: Lấy insights thành công
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
 *                   properties:
 *                     insights:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AIAnalysisResult'
 *                     overallStats:
 *                       $ref: '#/components/schemas/AIOverallStats'
 *                     count:
 *                       type: integer
 *                       example: 10
 *       403:
 *         description: Không có quyền truy cập hoặc cần upgrade gói
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cần nâng cấp gói Premium để sử dụng AI Analysis"
 *                 upgradeRequired:
 *                   type: boolean
 *                   example: true
 *                 premiumFeature:
 *                   type: string
 *                   example: "Phân tích AI huyết áp"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi server khi lấy AI insights"

 */

/**
 * @swagger
 * /api/blood-pressure/ai/status:
 *   get:
 *     tags:
 *       - Blood Pressure AI
 *     summary: Kiểm tra trạng thái AI service
 *     description: Kiểm tra trạng thái của AI service và quyền truy cập của user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trạng thái AI service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 aiServiceActive:
 *                   type: boolean
 *                   example: true
 *                 geminiAPIStatus:
 *                   type: string
 *                   example: "operational"
 *                 userAIAccess:
 *                   type: boolean
 *                   example: true
 *                 packageValid:
 *                   type: boolean
 *                   example: true
 *                 nextExpiry:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-12-31T23:59:59Z"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi server khi kiểm tra AI service"

 */


/**
 * @swagger
 * /api/blood-pressure/ai/analysis/{analysisId}:
 *   delete:
 *     tags:
 *       - Blood Pressure AI
 *     summary: Xóa phân tích AI
 *     description: Xóa một phân tích AI cụ thể
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phân tích AI
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Xóa phân tích thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đã xóa phân tích AI thành công"
 *       404:
 *         description: Không tìm thấy phân tích AI để xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy phân tích AI để xóa"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Lỗi server khi xóa phân tích AI"
 */