/**
 * @swagger
 * components:
 *   schemas:
 *     AIAnalysisCard:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Tiêu đề của phân tích
 *           example: "Tăng huyết áp độ 2"
 *         status:
 *           type: string
 *           enum: [warning, success, info]
 *           description: Trạng thái của phân tích
 *           example: "warning"
 *         metric:
 *           type: string
 *           description: Thông tin cụ thể về metric
 *           example: "Huyết áp hiện tại: 145/95 mmHg"
 *         icon:
 *           type: string
 *           description: Icon hiển thị
 *           example: "⚠️"
 *         recommendation:
 *           type: string
 *           description: Lời khuyên cụ thể
 *           example: "Cần đi khám bác sĩ trong 7 ngày"
 *       required:
 *         - title
 *         - status
 *         - metric
 *         - icon
 *         - recommendation
 *       example:
 *         title: "Tăng huyết áp độ 2"
 *         status: "warning"
 *         metric: "Huyết áp hiện tại: 145/95 mmHg"
 *         icon: "⚠️"
 *         recommendation: "Cần đi khám bác sĩ trong 7 ngày"
 *     
 *     AIAnalysisResult:
 *       type: object
 *       properties:
 *         userName:
 *           type: string
 *           description: Tên người dùng
 *           example: "Nguyễn Thị Lan"
 *         analyses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AIAnalysisCard'
 *           description: Danh sách các phân tích AI
 *           minItems: 3
 *           maxItems: 3
 *         summary:
 *           type: string
 *           description: Tóm tắt kết quả
 *           example: "Risk score 45/100 - Trung bình"
 *         riskScore:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Điểm đánh giá rủi ro từ 0-100
 *           example: 45
 *         riskLevel:
 *           type: string
 *           enum: [bình_thường, nhẹ, trung_bình, cao, nguy_hiểm]
 *           description: Mức độ rủi ro
 *           example: "trung_bình"
 *         urgency:
 *           type: string
 *           enum: [normal, high, urgent]
 *           description: Mức độ khẩn cấp
 *           example: "normal"
 *         analyzedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian phân tích
 *           example: "2024-01-15T10:30:00.000Z"
 *       required:
 *         - userName
 *         - analyses
 *         - summary
 *         - riskScore
 *         - riskLevel
 *         - urgency
 *         - analyzedAt
 *       example:
 *         userName: "Nguyễn Thị Lan"
 *         analyses:
 *           - title: "Tăng huyết áp độ 2"
 *             status: "warning"
 *             metric: "Huyết áp hiện tại: 145/95 mmHg"
 *             icon: "⚠️"
 *             recommendation: "Cần đi khám bác sĩ trong 7 ngày"
 *           - title: "Đo huyết áp đều đặn"
 *             status: "success"
 *             metric: "Bạn đã đo huyết áp đều đặn 7/7 ngày qua"
 *             icon: "✅"
 *             recommendation: "Hãy tiếp tục duy trì thói quen tốt này"
 *           - title: "Gợi ý từ AI"
 *             status: "info"
 *             metric: "Thời điểm tốt nhất để đo huyết áp là 7:00 AM"
 *             icon: "🧠"
 *             recommendation: "Đo huyết áp sau khi thức dậy 30 phút"
 *         summary: "Risk score 45/100 - Trung bình"
 *         riskScore: 45
 *         riskLevel: "trung_bình"
 *         urgency: "normal"
 *         analyzedAt: "2024-01-15T10:30:00.000Z"
 *     
 *     AIOverallStats:
 *       type: object
 *       properties:
 *         totalAnalyses:
 *           type: number
 *           description: Tổng số lần phân tích AI
 *           example: 15
 *         averageRiskScore:
 *           type: number
 *           description: Điểm rủi ro trung bình
 *           example: 42
 *         urgencyDistribution:
 *           type: object
 *           properties:
 *             normal:
 *               type: number
 *               example: 10
 *             high:
 *               type: number
 *               example: 3
 *             urgent:
 *               type: number
 *               example: 2
 *           description: Phân bố mức độ khẩn cấp
 *         riskLevelDistribution:
 *           type: object
 *           properties:
 *             bình_thường:
 *               type: number
 *               example: 8
 *             nhẹ:
 *               type: number
 *               example: 4
 *             trung_bình:
 *               type: number
 *               example: 2
 *             cao:
 *               type: number
 *               example: 1
 *           description: Phân bố mức độ rủi ro
 *         latestAnalysis:
 *           $ref: '#/components/schemas/AIAnalysisResult'
 *           description: Phân tích gần nhất
 *       example:
 *         totalAnalyses: 15
 *         averageRiskScore: 42
 *         urgencyDistribution:
 *           normal: 10
 *           high: 3
 *           urgent: 2
 *         riskLevelDistribution:
 *           bình_thường: 8
 *           nhẹ: 4
 *           trung_bình: 2
 *           cao: 1
 *         latestAnalysis:
 *           userName: "Nguyễn Thị Lan"
 *           analyses: [...]
 *           summary: "Risk score 45/100 - Trung bình"
 *           riskScore: 45
 *           riskLevel: "trung_bình"
 *           urgency: "normal"
 *           analyzedAt: "2024-01-15T10:30:00.000Z"
 */