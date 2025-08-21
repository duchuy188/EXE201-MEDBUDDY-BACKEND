/**
 * @swagger
 * tags:
 *   name: OCR
 *   description: Nhận diện ký tự quang học (OCR) cho toa thuốc
 */

/**
 * @swagger
 * /ocr:
 *   post:
 *     summary: Chuyển hình ảnh toa thuốc thành text
 *     tags: [OCR]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Ảnh toa thuốc
 *     responses:
 *       200:
 *         description: Danh sách thuốc nhận diện được từ ảnh
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 medicines:
 *                   type: array
 *                   description: Danh sách thuốc
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Tên thuốc
 *                       quantity:
 *                         type: string
 *                         description: Số lượng (viên, ống, ...)
 *                       usage:
 *                         type: string
 *                         description: Hướng dẫn sử dụng
 *       400:
 *         description: Không có ảnh được upload
 *       500:
 *         description: Lỗi xử lý OCR
 */
