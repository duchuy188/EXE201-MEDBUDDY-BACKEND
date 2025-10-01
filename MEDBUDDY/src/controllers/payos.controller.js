const payOS = require('../config/payos/payos.config');
const Package = require('../models/Package');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { sendPaymentConfirmationEmail, sendPaymentFailureEmail } = require('../services/paymentEmailService');
const { activateUserPackage } = require('../services/packageService');
const { formatVN, formatPackageExpiry } = require('../utils/dateHelper');

// Tạo payment link
exports.createPaymentLink = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user._id; 
    
   
    const packageInfo = await Package.findById(packageId);
    if (!packageInfo) {
      return res.status(404).json({ message: 'Package không tồn tại' });
    }
    
    
    const order = {
      amount: packageInfo.price,
      description: packageInfo.name.length > 25 ? packageInfo.name.substring(0, 25) : packageInfo.name,
      orderCode: Date.now(), 
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      items: [{
        name: packageInfo.name.length > 25 ? packageInfo.name.substring(0, 25) : packageInfo.name,
        quantity: 1,
        price: packageInfo.price
      }]
    };
    
   
    const paymentLinkResponse = await payOS.paymentRequests.create(order);
    
   
    const payment = new Payment({
      orderCode: paymentLinkResponse.orderCode,
      userId: userId,
      packageId: packageId,
      amount: packageInfo.price,
      description: order.description,
      paymentUrl: paymentLinkResponse.checkoutUrl,
      status: 'PENDING'
    });
    await payment.save();
    
    res.json({
      message: 'Tạo link thanh toán thành công',
      paymentUrl: paymentLinkResponse.checkoutUrl,
      orderCode: paymentLinkResponse.orderCode
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi tạo link thanh toán', 
      error: error.message 
    });
  }
};

// Xác nhận thanh toán
exports.confirmPayment = async (req, res) => {
  try {
    const { orderCode } = req.body;
    
    
    const paymentLinkInformation = await payOS.paymentRequests.get(orderCode);
    
    
    const payment = await Payment.findOne({ orderCode });
    
    if (!payment) {
      return res.status(404).json({ 
        message: 'Không tìm thấy giao dịch' 
      });
    }
    
    
    payment.status = paymentLinkInformation.status;
    payment.payosData = paymentLinkInformation;
    
    if (paymentLinkInformation.status === 'PAID') {
      payment.paidAt = new Date();
      
      
      const user = await User.findById(payment.userId);
      const packageInfo = await Package.findById(payment.packageId);
      
      if (user && packageInfo) {
        // Kích hoạt gói cho user
        try {
          await activateUserPackage(payment.userId, payment.packageId);
          console.log(`Package activated for user ${payment.userId}: ${packageInfo.name}`);
        } catch (activationError) {
          console.error('Error activating package:', activationError);
        }

      
        try {
          await sendPaymentConfirmationEmail(
            user.email,
            user.fullName,
            packageInfo.name,
            payment.amount,
            payment.orderCode
          );
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      }
      
    } else if (paymentLinkInformation.status === 'CANCELLED') {
      payment.cancelledAt = new Date();
    } else if (paymentLinkInformation.status === 'EXPIRED') {
      payment.expiredAt = new Date();
    }
    
    await payment.save();
    
    res.json({
      message: paymentLinkInformation.status === 'PAID' ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn thành',
      status: paymentLinkInformation.status,
      paymentInfo: paymentLinkInformation,
      updatedPayment: payment
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi xác nhận thanh toán', 
      error: error.message 
    });
  }
};

// Webhook nhận thông báo từ PayOS
exports.webhook = async (req, res) => {
  try {
    const { code, desc, success, data, signature } = req.body;
    
    console.log('Webhook received:', { code, desc, success, data, signature });
    
    
    
    const isValid = true; 
    
    if (isValid) {
     
      console.log('Webhook received:', data);
      
     
      const payment = await Payment.findOne({ orderCode: data.orderCode });
      
      if (payment) {
        
        payment.payosData = data;
        
        // Kiểm tra trạng thái thanh toán từ webhook data
        if (data.code === '00' && (data.desc === 'Thành công' || data.desc === 'success')) {
          payment.status = 'PAID';
          payment.paidAt = new Date();
          
          const user = await User.findById(payment.userId);
          const packageInfo = await Package.findById(payment.packageId);
          
          if (user && packageInfo) {
            // Kích hoạt gói cho user
            try {
              await activateUserPackage(payment.userId, payment.packageId);
              console.log(`Package activated for user ${payment.userId}: ${packageInfo.name}`);
            } catch (activationError) {
              console.error('Error activating package:', activationError);
            }

            // Gửi email xác nhận thanh toán thành công
            try {
              await sendPaymentConfirmationEmail(
                user.email,
                user.fullName,
                packageInfo.name,
                payment.amount,
                payment.orderCode
              );
            } catch (emailError) {
              console.error('Error sending confirmation email:', emailError);
            }
          }
          
        } else if (data.code !== '00') {
          payment.status = 'CANCELLED';
          payment.cancelledAt = new Date();
          
          const user = await User.findById(payment.userId);
          const packageInfo = await Package.findById(payment.packageId);
          
          if (user && packageInfo) {
            try {
              await sendPaymentFailureEmail(
                user.email,
                user.fullName,
                packageInfo.name,
                payment.amount,
                payment.orderCode,
                `Giao dịch thất bại: ${data.desc}`
              );
            } catch (emailError) {
              console.error('Error sending failure email:', emailError);
            }
          }
        }
        
        await payment.save();
        console.log('Payment updated:', payment.orderCode, payment.status);
      }
      
      res.status(200).json({ 
        message: 'Webhook processed successfully',
        code: '00',
        desc: 'success'
      });
    } else {
      console.error('Invalid webhook signature');
      res.status(400).json({ 
        message: 'Invalid signature',
        code: '01',
        desc: 'Invalid signature'
      });
    }
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ 
      message: 'Lỗi xử lý webhook', 
      error: error.message,
      code: '01',
      desc: 'Internal server error'
    });
  }
};

// Xử lý Return URL - khi thanh toán thành công
exports.handleReturn = async (req, res) => {
  try {
    const { code, id, cancel, status, orderCode } = req.query;
    
    console.log('Return URL called:', { code, id, cancel, status, orderCode });
    
    // Redirect về frontend với thông tin thanh toán
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/payment-success?code=${code}&orderCode=${orderCode}&status=${status}&cancel=${cancel}`;
    
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Return URL error:', error);
    res.status(500).json({ 
      message: 'Lỗi xử lý return URL', 
      error: error.message 
    });
  }
};

// Xử lý Cancel URL - khi hủy thanh toán
exports.handleCancel = async (req, res) => {
  try {
    const { code, id, cancel, status, orderCode } = req.query;
    
    console.log('Cancel URL called:', { code, id, cancel, status, orderCode });
    
    // Redirect về frontend với thông tin hủy thanh toán
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/payment-cancel?code=${code}&orderCode=${orderCode}&status=${status}&cancel=${cancel}`;
    
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Cancel URL error:', error);
    res.status(500).json({ 
      message: 'Lỗi xử lý cancel URL', 
      error: error.message 
    });
  }
};

// Lấy thông tin payment link
exports.getPaymentInfo = async (req, res) => {
  try {
    const { orderCode } = req.params;
    
    const paymentInfo = await payOS.paymentRequests.get(orderCode);
    
    res.json({
      message: 'Thông tin giao dịch',
      paymentInfo
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Lỗi lấy thông tin giao dịch', 
      error: error.message 
    });
  }
};



// Lịch sử giao dịch tất cả users (Admin only)
exports.getAllPaymentHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentMethod,
      userId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search 
    } = req.query;

    
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    
    if (search) {
      filter.orderCode = parseInt(search);
    }

   
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    
    const payments = await Payment.find(filter)
      .populate('userId', 'fullName email phoneNumber avatar role')
      .populate('packageId', 'name description price duration unit features')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    
    const totalPayments = await Payment.countDocuments(filter);

    
    const stats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPaid: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0] 
            } 
          },
          totalPending: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'PENDING'] }, '$amount', 0] 
            } 
          },
          totalCancelled: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'CANCELLED'] }, '$amount', 0] 
            } 
          },
          totalExpired: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'EXPIRED'] }, '$amount', 0] 
            } 
          },
          countPaid: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] 
            } 
          },
          countPending: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] 
            } 
          },
          countCancelled: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] 
            } 
          },
          countExpired: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'EXPIRED'] }, 1, 0] 
            } 
          }
        }
      }
    ]);

    const statistics = stats[0] || {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalCancelled: 0,
      totalExpired: 0,
      countPaid: 0,
      countPending: 0,
      countCancelled: 0,
      countExpired: 0
    };

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPayments / parseInt(limit)),
          totalItems: totalPayments,
          itemsPerPage: parseInt(limit)
        },
        statistics
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy lịch sử giao dịch',
      error: error.message
    });
  }
};

// Thống kê dashboard - Tổng quan
exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    
    const overallStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0] 
            } 
          },
          totalTransactions: { $sum: 1 },
          successfulTransactions: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] 
            } 
          },
          pendingTransactions: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] 
            } 
          },
          cancelledTransactions: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] 
            } 
          },
          expiredTransactions: { 
            $sum: { 
              $cond: [{ $eq: ['$status', 'EXPIRED'] }, 1, 0] 
            } 
          },
          averageTransactionValue: { 
            $avg: { 
              $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', null] 
            } 
          }
        }
      }
    ]);

    // Thống kê theo ngày (7 ngày gần nhất)
    const dailyStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              totalAmount: '$totalAmount'
            }
          },
          totalCount: { $sum: '$count' },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    // Thống kê theo package
    const packageStats = await Payment.aggregate([
      { 
        $match: { 
          ...filter,
          status: 'PAID' 
        } 
      },
      {
        $group: {
          _id: '$packageId',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'packages',
          localField: '_id',
          foreignField: '_id',
          as: 'package'
        }
      },
      { $unwind: '$package' },
      {
        $project: {
          packageName: '$package.name',
          count: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Tỷ lệ thành công
    const overall = overallStats[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      successfulTransactions: 0,
      pendingTransactions: 0,
      cancelledTransactions: 0,
      expiredTransactions: 0,
      averageTransactionValue: 0
    };

    const successRate = overall.totalTransactions > 0 
      ? ((overall.successfulTransactions / overall.totalTransactions) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        overview: {
          ...overall,
          successRate: parseFloat(successRate)
        },
        dailyStats,
        packageStats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê dashboard',
      error: error.message
    });
  }
};

// Chi tiết giao dịch (Admin)
exports.getPaymentDetail = async (req, res) => {
  try {
    const { orderCode } = req.params;

    const payment = await Payment.findOne({ orderCode })
      .populate('userId', 'fullName email phoneNumber avatar role dateOfBirth')
      .populate('packageId', 'name description price duration unit features');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy giao dịch'
      });
    }

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy chi tiết giao dịch',
      error: error.message
    });
  }
};
