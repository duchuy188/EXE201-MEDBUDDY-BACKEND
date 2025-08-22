const path = require('path');

module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MEDBUDDY API',
      version: '1.0.0',
      description: 'API documentation for MEDBUDDY',
    },
    servers: [
      {
        url: 'http://localhost:' + (process.env.PORT || 5000),
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, './apis/*.js'),
    path.join(__dirname, './schemas/*.js'),
    path.join(__dirname, '../../routes/*.js'),
    path.join(__dirname, '../../controllers/*.js'),
  ],
};
