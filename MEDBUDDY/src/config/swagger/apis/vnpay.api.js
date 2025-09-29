/**
 * @swagger
 * tags:
 *   name: VNPay
 *   description: Thanh toán VNPay
 */

/**
 * @swagger
 * /vnpay/create-payment:
 *   post:
 *     tags: [VNPay]
 *     summary: Tạo link thanh toán VNPay cho gói dịch vụ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 19000
 *               orderType:
 *                 type: string
 *                 example: "package"
 *               orderDescription:
 *                 type: string
 *                 example: "Thanh toán gói HAP+ CƠ BẢN"
 *               userId:
 *                 type: string
 *                 example: "user_id"
 *     responses:
 *       200:
 *         description: Link thanh toán VNPay
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
 *       500:
 *         description: Lỗi tạo link thanh toán VNPay
 */
