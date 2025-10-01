const nodemailer = require('nodemailer');

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm gửi email xác nhận thanh toán thành công
async function sendPaymentConfirmationEmail(userEmail, userName, packageName, amount, orderCode) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'HAP MEDBUDDY - Xác nhận thanh toán thành công',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #00A8CC; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🎉 Thanh toán thành công!</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${userName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">Chúc mừng! Bạn đã thanh toán thành công gói dịch vụ:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00A8CC;">
            <h3 style="color: #00A8CC; margin-top: 0;">📦 ${packageName}</h3>
            <p style="margin: 5px 0;"><strong>Số tiền:</strong> ${amount.toLocaleString('vi-VN')} VND</p>
            <p style="margin: 5px 0;"><strong>Mã giao dịch:</strong> ${orderCode}</p>
            <p style="margin: 5px 0;"><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          </div>
          
          <p style="font-size: 16px; color: #333;">Gói dịch vụ của bạn đã được kích hoạt và sẵn sàng sử dụng.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://medbuddy.app'}" 
               style="background-color: #00A8CC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Truy cập HAP MEDBUDDY
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center;">
            Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ HAP MEDBUDDY!<br>
            Nếu có thắc mắc, vui lòng liên hệ hỗ trợ.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
}

// Hàm gửi email thông báo thanh toán thất bại
async function sendPaymentFailureEmail(userEmail, userName, packageName, amount, orderCode, reason) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'MEDBUDDY - Thông báo thanh toán thất bại',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">❌ Thanh toán thất bại</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${userName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">Chúng tôi xin thông báo rằng giao dịch thanh toán của bạn đã thất bại:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
            <h3 style="color: #f44336; margin-top: 0;">📦 ${packageName}</h3>
            <p style="margin: 5px 0;"><strong>Số tiền:</strong> ${amount.toLocaleString('vi-VN')} VND</p>
            <p style="margin: 5px 0;"><strong>Mã giao dịch:</strong> ${orderCode}</p>
            <p style="margin: 5px 0;"><strong>Lý do:</strong> ${reason}</p>
          </div>
          
          <p style="font-size: 16px; color: #333;">Vui lòng thử lại hoặc liên hệ hỗ trợ nếu cần thiết.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://medbuddy.app'}" 
               style="background-color: #00A8CC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Thử lại thanh toán
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center;">
            Nếu có thắc mắc, vui lòng liên hệ hỗ trợ.<br>
            HAP MEDBUDDY Team
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Payment failure email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending payment failure email:', error);
    throw error;
  }
}

module.exports = {
  sendPaymentConfirmationEmail,
  sendPaymentFailureEmail
};
