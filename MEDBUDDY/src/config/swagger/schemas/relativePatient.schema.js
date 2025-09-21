// Swagger schema for RelativePatient

/**
 * @swagger
 * components:
 *   schemas:
 *     RelativePatient:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         patient:
 *           $ref: '#/components/schemas/User'
 *         relative:
 *           $ref: '#/components/schemas/User'
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
module.exports = {};
