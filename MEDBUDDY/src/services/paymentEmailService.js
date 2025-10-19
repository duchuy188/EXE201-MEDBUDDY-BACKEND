const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPaymentConfirmationEmail(userEmail, userName, packageName, amount, orderCode) {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #00A8CC; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🎉 Thanh toán thành công!</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Bạn đã thanh toán thành công gói dịch vụ:</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00A8CC;">
            <h3 style="color: #00A8CC; margin-top: 0;">📦 ${packageName}</h3>
            <p><strong>Số tiền:</strong> ${amount.toLocaleString('vi-VN')} VND</p>
            <p><strong>Mã giao dịch:</strong> ${orderCode}</p>
            <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://medbuddy.app'}"
              style="background-color: #00A8CC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Truy cập HAP MEDBUDDY
            </a>
          </div>
          <p style="text-align:center;color:#666;font-size:14px;">
            Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ HAP MEDBUDDY!
          </p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'HAP MEDBUDDY - Xác nhận thanh toán thành công',
      html,
    });

    console.log('✅ Payment confirmation email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
    throw error;
  }
}

async function sendPaymentFailureEmail(userEmail, userName, packageName, amount, orderCode, reason) {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">❌ Thanh toán thất bại</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Giao dịch thanh toán của bạn đã thất bại:</p>
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
            <h3 style="color: #f44336; margin-top: 0;">📦 ${packageName}</h3>
            <p><strong>Số tiền:</strong> ${amount.toLocaleString('vi-VN')} VND</p>
            <p><strong>Mã giao dịch:</strong> ${orderCode}</p>
            <p><strong>Lý do:</strong> ${reason}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://medbuddy.app'}"
              style="background-color: #00A8CC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Thử lại thanh toán
            </a>
          </div>
          <p style="text-align:center;color:#666;font-size:14px;">
            Nếu có thắc mắc, vui lòng liên hệ hỗ trợ.<br>HAP MEDBUDDY Team
          </p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'HAP MEDBUDDY - Thanh toán thất bại',
      html,
    });

    console.log('⚠️ Payment failure email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending payment failure email:', error);
    throw error;
  }
}

module.exports = {
  sendPaymentConfirmationEmail,
  sendPaymentFailureEmail,
};
