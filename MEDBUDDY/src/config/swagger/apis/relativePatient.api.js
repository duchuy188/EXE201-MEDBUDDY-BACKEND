/**
 * @swagger
 * /relative-patient/confirm:
 *   post:
 *     tags: [RelativePatient]
 *     summary: Xác nhận liên kết bằng mã OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               linkId:
 *                 type: string
 *                 example: "6510b2e2c8a1f2b1a1a1a1"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Xác nhận liên kết thành công
 *       400:
 *         description: Mã OTP không đúng hoặc đã hết hạn
 *       404:
 *         description: Không tìm thấy liên kết
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * tags:
 *   name: RelativePatient
 *   description: Quản lý liên kết người thân-người bệnh
 */

/**
 * @swagger
 * /relative-patient/add:
 *   post:
 *     tags: [RelativePatient]
 *     summary: Người bệnh thêm người thân vào danh sách theo dõi
 *     description: Chỉ người bệnh (role=patient) mới có thể thêm người thân (role=relative)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "relative@example.com"
 *     responses:
 *       201:
 *         description: Đã gửi mã OTP xác nhận tới email người thân
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã gửi mã OTP xác nhận tới email người thân"
 *                 linkId:
 *                   type: string
 *                   example: "6510b2e2c8a1f2b1a1a1a1a1"
 *       400:
 *         description: Email không hợp lệ hoặc đã tồn tại liên kết
 *       403:
 *         description: Không có quyền thực hiện (chỉ patient mới được thêm relative)
 *       404:
 *         description: Không tìm thấy người thân với email này
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/add-patient:
 *   post:
 *     tags: [RelativePatient]
 *     summary: Người thân thêm người bệnh vào danh sách theo dõi
 *     description: Chỉ người thân (role=relative) mới có thể thêm người bệnh (role=patient)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "patient@example.com"
 *     responses:
 *       201:
 *         description: Đã gửi mã OTP xác nhận tới email người bệnh
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã gửi mã OTP xác nhận tới email người bệnh"
 *                 linkId:
 *                   type: string
 *                   example: "6510b2e2c8a1f2b1a1a1a1a1"
 *       400:
 *         description: Email không hợp lệ hoặc đã tồn tại liên kết hoặc đã gửi lời mời
 *       403:
 *         description: Không có quyền thực hiện (chỉ relative mới được thêm patient)
 *       404:
 *         description: Không tìm thấy người bệnh với email này
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients:
 *   get:
 *     tags: [RelativePatient]
 *     summary: Lấy danh sách người bệnh của người thân
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người bệnh
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/relatives:
 *   get:
 *     tags: [RelativePatient]
 *     summary: Lấy danh sách người thân của người bệnh
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người thân
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/delete:
 *   post:
 *     tags: [RelativePatient]
 *     summary: Xóa liên kết giữa người bệnh và người thân
 *     description: Chỉ người bệnh hoặc người thân liên quan mới được xóa liên kết
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               linkId:
 *                 type: string
 *                 example: "6510b2e2c8a1f2b1a1a1a1a1"
 *             required:
 *               - linkId
 *     responses:
 *       200:
 *         description: Xóa liên kết thành công
 *       403:
 *         description: Không có quyền xóa liên kết này
 *       404:
 *         description: Không tìm thấy liên kết
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients/{patientId}/medication-reminder:
 *   post:
 *     tags: [RelativePatient]
 *     summary: Người thân đặt lịch uống thuốc cho bệnh nhân
 *     description: Chỉ người thân có quyền schedule_medication mới có thể tạo lịch uống thuốc
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMedicationReminderRequest'
 *     responses:
 *       200:
 *         description: Đặt lịch uống thuốc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/MedicationReminderResponse'
 *       403:
 *         description: Không có quyền thực hiện
 *       404:
 *         description: Không tìm thấy thuốc
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients/{patientId}/appointment:
 *   post:
 *     tags: [RelativePatient]
 *     summary: Người thân đặt lịch tái khám cho bệnh nhân
 *     description: Chỉ người thân có quyền schedule_appointment mới có thể tạo lịch tái khám
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *     responses:
 *       200:
 *         description: Đặt lịch tái khám thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AppointmentResponse'
 *       403:
 *         description: Không có quyền thực hiện
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients/{patientId}/medication-reminders:
 *   get:
 *     tags: [RelativePatient]
 *     summary: Lấy danh sách lịch uống thuốc của bệnh nhân
 *     description: Người thân xem danh sách lịch uống thuốc của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *     responses:
 *       200:
 *         description: Danh sách lịch uống thuốc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MedicationReminderResponse'
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients/{patientId}/appointments:
 *   get:
 *     tags: [RelativePatient]
 *     summary: Lấy danh sách lịch tái khám của bệnh nhân
 *     description: Người thân xem danh sách lịch tái khám của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *     responses:
 *       200:
 *         description: Danh sách lịch tái khám
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AppointmentResponse'
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients/{patientId}/medication-reminder/{reminderId}:
 *   put:
 *     tags: [RelativePatient]
 *     summary: Cập nhật lịch uống thuốc của bệnh nhân
 *     description: Người thân cập nhật lịch uống thuốc cho bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *       - in: path
 *         name: reminderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch uống thuốc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMedicationReminderRequest'
 *     responses:
 *       200:
 *         description: Cập nhật lịch uống thuốc thành công
 *       403:
 *         description: Không có quyền thực hiện
 *       404:
 *         description: Không tìm thấy lịch uống thuốc
 *       500:
 *         description: Lỗi server
 *   delete:
 *     tags: [RelativePatient]
 *     summary: Xóa lịch uống thuốc của bệnh nhân
 *     description: Người thân xóa lịch uống thuốc cho bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *       - in: path
 *         name: reminderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch uống thuốc
 *     responses:
 *       200:
 *         description: Xóa lịch uống thuốc thành công
 *       403:
 *         description: Không có quyền thực hiện
 *       404:
 *         description: Không tìm thấy lịch uống thuốc
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients/{patientId}/appointment/{appointmentId}:
 *   put:
 *     tags: [RelativePatient]
 *     summary: Cập nhật lịch tái khám của bệnh nhân  
 *     description: Người thân cập nhật lịch tái khám cho bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch tái khám
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *     responses:
 *       200:
 *         description: Cập nhật lịch tái khám thành công
 *       403:
 *         description: Không có quyền thực hiện
 *       404:
 *         description: Không tìm thấy lịch tái khám
 *       500:
 *         description: Lỗi server
 *   delete:
 *     tags: [RelativePatient]
 *     summary: Xóa lịch tái khám của bệnh nhân
 *     description: Người thân xóa lịch tái khám cho bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của lịch tái khám
 *     responses:
 *       200:
 *         description: Xóa lịch tái khám thành công
 *       403:
 *         description: Không có quyền thực hiện
 *       404:
 *         description: Không tìm thấy lịch tái khám
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients/{patientId}/medications:
 *   get:
 *     tags: [RelativePatient]
 *     summary: Lấy danh sách thuốc của bệnh nhân
 *     description: Người thân xem danh sách thuốc của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *     responses:
 *       200:
 *         description: Danh sách thuốc
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Medication'
 *       403:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 *   post:
 *     tags: [RelativePatient]
 *     summary: Thêm thuốc mới cho bệnh nhân
 *     description: Người thân thêm thuốc mới cho bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - times
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên thuốc
 *               form:
 *                 type: string
 *                 description: Dạng thuốc (viên, lọ, ...)
 *               image:
 *                 type: string
 *                 description: URL hình ảnh thuốc
 *               note:
 *                 type: string
 *                 description: Ghi chú
 *               quantity:
 *                 type: string
 *                 description: Tổng số lượng thuốc
 *               times:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: string
 *                       enum: [Sáng, Chiều, Tối]
 *                     dosage:
 *                       type: string
 *                       description: Liều lượng
 *     responses:
 *       200:
 *         description: Thêm thuốc thành công
 *       403:
 *         description: Không có quyền thực hiện
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /relative-patient/patients/{patientId}/medications/{medicationId}:
 *   get:
 *     tags: [RelativePatient]
 *     summary: Lấy chi tiết thuốc của bệnh nhân
 *     description: Người thân xem chi tiết thuốc của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thuốc
 *     responses:
 *       200:
 *         description: Chi tiết thuốc
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy thuốc
 *       500:
 *         description: Lỗi server
 *   put:
 *     tags: [RelativePatient]
 *     summary: Cập nhật thuốc của bệnh nhân
 *     description: Người thân cập nhật thông tin thuốc của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thuốc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               form:
 *                 type: string
 *               image:
 *                 type: string
 *               note:
 *                 type: string
 *               quantity:
 *                 type: string
 *               times:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: string
 *                       enum: [Sáng, Chiều, Tối]
 *                     dosage:
 *                       type: string
 *     responses:
 *       200:
 *         description: Cập nhật thuốc thành công
 *       403:
 *         description: Không có quyền thực hiện
 *       404:
 *         description: Không tìm thấy thuốc
 *       500:
 *         description: Lỗi server
 *   delete:
 *     tags: [RelativePatient]
 *     summary: Xóa thuốc của bệnh nhân
 *     description: Người thân xóa thuốc của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bệnh nhân
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thuốc
 *     responses:
 *       200:
 *         description: Xóa thuốc thành công
 *       403:
 *         description: Không có quyền thực hiện
 *       404:
 *         description: Không tìm thấy thuốc
 *       500:
 *         description: Lỗi server
 */
