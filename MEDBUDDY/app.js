
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// Kết nối MongoDB
const connectDB = require('./src/config/database');
connectDB();

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerOptions = require('./src/config/swagger/swagger');
const swaggerSpec = swaggerJsdoc(swaggerOptions);


var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/users');
var authRouter = require('./src/routes/auth.route');
var adminRouter = require('./src/routes/admin');
var alertsRouter = require('./src/routes/alerts');
var bloodPressureRouter = require('./src/routes/bloodPressure');
var medicationsRouter = require('./src/routes/medications');
var medicationsHistoryRouter = require('./src/routes/medicationsHistory');
var notificationsRouter = require('./src/routes/notifications');
var remindersRouter = require('./src/routes/reminders');

var app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests từ localhost (development), React Native và production domains
    const allowedOrigins = [
      'http://localhost:3000',      // React development server
      'http://localhost:3001',      // Alternative React port
      'http://localhost:19006',     // Expo development server
      'exp://192.168.1.100:19000',  // Expo client (thay đổi IP theo máy của bạn)
      'exp://localhost:19000',      // Expo localhost
      undefined                     // React Native không gửi origin
    ];
    
    // Trong development, cho phép tất cả origins
    if (process.env.NODE_ENV === 'development' || !origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // Để hỗ trợ legacy browsers
};

app.use(cors(corsOptions));



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/blood-pressure', bloodPressureRouter);
app.use('/api/medications', medicationsRouter);
app.use('/api/medications-history', medicationsHistoryRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/reminders', remindersRouter);

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    authAction: {
      JWT: {
        name: "JWT",
        schema: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "Enter JWT Bearer token **_only_**"
        },
        value: "Bearer <JWT>"
      }
    }
  }
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
