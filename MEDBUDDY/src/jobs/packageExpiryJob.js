const cron = require('node-cron');
const User = require('../models/User');
const fcmService = require('../services/fcmService');

// Job kiểm tra gói hết hạn - chạy mỗi ngày lúc 00:00
const packageExpiryJob = cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🔄 [PACKAGE-JOB] Đang kiểm tra gói hết hạn...');
    
    const now = new Date();
    const currentDate = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0');
    
    // Tìm các user có gói hết hạn hôm nay
    const expiredUsers = await User.find({
      'activePackage.isActive': true,
      'activePackage.endDate': { $lt: now }
    }).populate('activePackage.packageId');

    if (expiredUsers.length > 0) {
      console.log(`📢 [PACKAGE-JOB] Tìm thấy ${expiredUsers.length} gói hết hạn`);
      
      // Cập nhật trạng thái gói hết hạn
      await User.updateMany(
        {
          'activePackage.isActive': true,
          'activePackage.endDate': { $lt: now }
        },
        {
          'activePackage.isActive': false
        }
      );

      // Gửi thông báo cho user có gói hết hạn
      for (const user of expiredUsers) {
        try {
          
          const tokens = await require('../models/NotificationToken').find({ userId: user._id });
          const NotificationHistory = require('../models/NotificationHistory');
          
          for (const tokenDoc of tokens) {
            console.log(`📱 [PACKAGE-JOB] Gửi thông báo hết hạn cho user ${user._id}`);
            
            await fcmService.sendNotification(
              String(tokenDoc.deviceToken),
              'Gói dịch vụ hết hạn',
              `Gói ${user.activePackage.packageId.name} của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.`,
              'default'
            );
            
            await NotificationHistory.create({
              userId: user._id,
              title: 'Gói dịch vụ hết hạn',
              body: `Gói ${user.activePackage.packageId.name} của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.`,
              deviceToken: tokenDoc.deviceToken,
              sentAt: new Date(),
              sound: 'default'
            });
          }
        } catch (notificationError) {
          console.error(`❌ [PACKAGE-JOB] Lỗi gửi thông báo cho user ${user._id}:`, notificationError);
        }
      }
      
      console.log(`✅ [PACKAGE-JOB] Đã xử lý ${expiredUsers.length} gói hết hạn`);
    } else {
      console.log('✅ [PACKAGE-JOB] Không có gói nào hết hạn hôm nay');
    }
    
  } catch (error) {
    console.error('❌ [PACKAGE-JOB] Lỗi kiểm tra gói hết hạn:', error);
  }
}, {
  scheduled: false, 
  timezone: "Asia/Ho_Chi_Minh"
});

// Job kiểm tra gói sắp hết hạn - chạy mỗi ngày lúc 09:00
const packageExpiringSoonJob = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('🔄 [PACKAGE-JOB] Đang kiểm tra gói sắp hết hạn...');
    
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3); 
    
    // Tìm các user có gói sắp hết hạn trong 3 ngày
    const expiringUsers = await User.find({
      'activePackage.isActive': true,
      'activePackage.endDate': { $lte: futureDate, $gt: now }
    }).populate('activePackage.packageId');

    if (expiringUsers.length > 0) {
      console.log(`📢 [PACKAGE-JOB] Tìm thấy ${expiringUsers.length} gói sắp hết hạn`);
      
      // Gửi thông báo cho user có gói sắp hết hạn
      for (const user of expiringUsers) {
        try {
          const daysRemaining = Math.ceil((user.activePackage.endDate - now) / (1000 * 60 * 60 * 24));
          
         
          const tokens = await require('../models/NotificationToken').find({ userId: user._id });
          const NotificationHistory = require('../models/NotificationHistory');
          
          for (const tokenDoc of tokens) {
            console.log(`📱 [PACKAGE-JOB] Gửi thông báo sắp hết hạn cho user ${user._id}`);
            
            await fcmService.sendNotification(
              String(tokenDoc.deviceToken),
              'Gói dịch vụ sắp hết hạn',
              `Gói ${user.activePackage.packageId.name} của bạn sẽ hết hạn trong ${daysRemaining} ngày. Vui lòng gia hạn sớm!`,
              'default'
            );
            
            await NotificationHistory.create({
              userId: user._id,
              title: 'Gói dịch vụ sắp hết hạn',
              body: `Gói ${user.activePackage.packageId.name} của bạn sẽ hết hạn trong ${daysRemaining} ngày. Vui lòng gia hạn sớm!`,
              deviceToken: tokenDoc.deviceToken,
              sentAt: new Date(),
              sound: 'default'
            });
          }
        } catch (notificationError) {
          console.error(`❌ [PACKAGE-JOB] Lỗi gửi thông báo cho user ${user._id}:`, notificationError);
        }
      }
      
      console.log(`✅ [PACKAGE-JOB] Đã gửi thông báo cho ${expiringUsers.length} gói sắp hết hạn`);
    } else {
      console.log('✅ [PACKAGE-JOB] Không có gói nào sắp hết hạn');
    }
    
  } catch (error) {
    console.error('❌ [PACKAGE-JOB] Lỗi kiểm tra gói sắp hết hạn:', error);
  }
}, {
  scheduled: false, 
  timezone: "Asia/Ho_Chi_Minh"
});

// Hàm start tất cả jobs
const startPackageJobs = () => {
  console.log('🚀 [PACKAGE-JOB] Starting package management jobs...');
  
  packageExpiryJob.start();
  packageExpiringSoonJob.start();
  
  console.log('✅ [PACKAGE-JOB] Package management jobs started successfully');
};

// Hàm stop tất cả jobs
const stopPackageJobs = () => {
  console.log('🛑 [PACKAGE-JOB] Stopping package management jobs...');
  
  packageExpiryJob.stop();
  packageExpiringSoonJob.stop();
  
  console.log('✅ [PACKAGE-JOB] Package management jobs stopped');
};


const runPackageExpiryCheck = async () => {
  try {
    console.log('🔄 [PACKAGE-JOB] Running package expiry check manually...');
    
    const now = new Date();
    const expiredUsers = await User.find({
      'activePackage.isActive': true,
      'activePackage.endDate': { $lt: now }
    }).populate('activePackage.packageId');
    
    console.log(`✅ [PACKAGE-JOB] Found ${expiredUsers.length} expired packages`);
    
    return expiredUsers;
  } catch (error) {
    console.error('❌ [PACKAGE-JOB] Error in manual package expiry check:', error);
    throw error;
  }
};

const runPackageExpiringSoonCheck = async () => {
  try {
    console.log('🔄 [PACKAGE-JOB] Running package expiring soon check manually...');
    
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    const expiringUsers = await User.find({
      'activePackage.isActive': true,
      'activePackage.endDate': { $lte: futureDate, $gt: now }
    }).populate('activePackage.packageId');
    
    console.log(`✅ [PACKAGE-JOB] Found ${expiringUsers.length} packages expiring soon`);
    
    return expiringUsers;
  } catch (error) {
    console.error('❌ [PACKAGE-JOB] Error in manual package expiring soon check:', error);
    throw error;
  }
};

module.exports = {
  packageExpiryJob,
  packageExpiringSoonJob,
  startPackageJobs,
  stopPackageJobs,
  runPackageExpiryCheck,
  runPackageExpiringSoonCheck
};
