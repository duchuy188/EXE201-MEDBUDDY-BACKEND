/**
 * @swagger
/*
@swagger
/users/change-password:
  post:
    summary: Đổi mật khẩu cho user
    tags:
      - Users
    security:
      - JWT: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              currentPassword:
                type: string
              newPassword:
                type: string
              confirmNewPassword:
                type: string
    responses:
      200:
        description: Đổi mật khẩu thành công
      400:
        description: Lỗi dữ liệu đầu vào hoặc xác thực
      401:
        description: Không xác thực hoặc token không hợp lệ
      404:
        description: Không tìm thấy người dùng
      500:
        description: Lỗi server
*/
/**
 * @swagger
/*
@swagger
/users/remove-avatar:
  delete:
    summary: Xóa avatar của user
    tags:
      - Users
    security:
      - JWT: []
    responses:
      200:
        description: Xóa avatar thành công
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                user:
                  $ref: '#/components/schemas/User'
      401:
        description: Không xác thực hoặc token không hợp lệ
      500:
        description: Lỗi server
*/

/**
 * @swagger
/*
@swagger
/users/dashboard:
  get:
    summary: Dashboard test quyền
    tags:
      - Users
    security:
      - JWT: []
    responses:
      200:
        description: Trả về message chào role
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
      401:
        description: Không xác thực hoặc token không hợp lệ
*/
/**
 * @swagger
/*
@swagger
/users/profile:
  get:
    summary: Lấy profile của chính user đã đăng nhập
    tags:
      - Users
    security:
      - JWT: []
    responses:
      200:
        description: Lấy profile thành công
        content:
          application/json:
            schema:
              type: object
              properties:
                user:
                  $ref: '#/components/schemas/User'
      401:
        description: Không xác thực hoặc token không hợp lệ
      404:
        description: Không tìm thấy user
      500:
        description: Lỗi server
*/
/**
 * @swagger
/*
@swagger
/users/all:
  get:
    summary: Lấy tất cả user
    tags:
      - Users
    security:
      - JWT: []
    responses:
      200:
        description: Lấy danh sách user thành công
        content:
          application/json:
            schema:
              type: object
              properties:
                users:
                  type: array
                  items:
                    $ref: '#/components/schemas/User'
      401:
        description: Không xác thực hoặc token không hợp lệ
      500:
        description: Lỗi server
*/
/**
 * @swagger
/*
@swagger
/users/profile:
  put:
    summary: Cập nhật profile của chính user (không được sửa role)
    tags:
      - Users
    security:
      - JWT: []
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            type: object
            properties:
              name:
                type: string
                example: Nguyễn Văn A
              email:
                type: string
                example: user@email.com
              phone:
                type: string
                example: "0987654321"
              password:
                type: string
                example: "newpassword"
              avatar:
                type: string
                format: binary
    responses:
      200:
        description: Cập nhật profile thành công
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                user:
                  $ref: '#/components/schemas/User'
      400:
        description: Lỗi dữ liệu đầu vào hoặc xác thực
      401:
        description: Không xác thực hoặc token không hợp lệ
      500:
        description: Lỗi server
*/
