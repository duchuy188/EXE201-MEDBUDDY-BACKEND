// Swagger schema for user

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *         - phoneNumber
 *         - password
 *         - role
 *         - dateOfBirth
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         fullName:
 *           type: string
 *           description: The full name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         phoneNumber:
 *           type: string
 *           description: The phone number of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         role:
 *           type: string
 *           enum: [relative, patient, admin]
 *           description: The role of the user
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: The date of birth of the user
 *         avatar:
 *           type: string
 *           description: The avatar URL of the user
 *         isBlocked:
 *           type: boolean
 *           default: false
 *           description: Whether the user is blocked
 *         blockedAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was blocked
 *         blockedBy:
 *           type: string
 *           description: The ID of the admin who blocked the user
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was last updated
 *       example:
 *         _id: 60f7b3b3b3b3b3b3b3b3b3b3
 *         fullName: "Nguyễn Văn A"
 *         email: "user@example.com"
 *         phoneNumber: "0123456789"
 *         role: "patient"
 *         dateOfBirth: "1990-01-01"
 *         avatar: "https://example.com/avatar.jpg"
 *         isBlocked: false
 *         blockedAt: null
 *         blockedBy: null
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 *     
 *     RefreshToken:
 *       type: object
 *       required:
 *         - token
 *         - userId
 *         - expiresAt
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the refresh token
 *         token:
 *           type: string
 *           description: The refresh token string
 *         userId:
 *           type: string
 *           description: The ID of the user who owns this token
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: The expiration date of the token
 *         isRevoked:
 *           type: boolean
 *           default: false
 *           description: Whether the token is revoked
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the token was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the token was last updated
 *       example:
 *         _id: 60f7b3b3b3b3b3b3b3b3b3b3
 *         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         userId: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         expiresAt: "2023-01-08T00:00:00.000Z"
 *         isRevoked: false
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 */
module.exports = {};
