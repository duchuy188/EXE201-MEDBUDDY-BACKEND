const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Hàm gửi email xác nhận liên kết người thân
async function sendInviteEmail(toEmail, patientName, relativeName, confirmLink, otpCode) {
  const mailOptions = {
    from: process.env.EMAIL_FROM, // ví dụ: "MedBuddy <noreply@medbuddy.vn>"
    to: toEmail,
    subject: 'HAP MEDBUDDY - Lời mời liên kết người thân',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #00A8CC; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">👥 Lời mời liên kết người thân</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${patientName}</strong>,</p>
          
          <p style="font-size: 16px; color: #333;">Bạn nhận được lời mời liên kết từ:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00A8CC;">
            <h3 style="color: #00A8CC; margin-top: 0;">👤 ${relativeName}</h3>
            <p style="margin: 5px 0; color: #666;">muốn trở thành người thân của bạn trên HAP MEDBUDDY</p>
            <p style="margin: 5px 0; color: #666;"><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          </div>
          
          <p style="font-size: 16px; color: #333;">Khi chấp nhận lời mời, ${relativeName} sẽ có thể:</p>
          <ul style="color: #333; padding-left: 20px;">
            <li>Xem thông tin sức khỏe của bạn</li>
            <li>Nhận thông báo về lịch hẹn và nhắc nhở thuốc</li>
            <li>Hỗ trợ quản lý sức khỏe hàng ngày</li>
          </ul>
          
          <div style="background-color: #e8f4fd; border: 2px solid #00A8CC; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #00A8CC; margin-top: 0;">🔐 Mã OTP xác nhận liên kết</h3>
            <p style="font-size: 24px; font-weight: bold; color: #00A8CC; margin: 10px 0; letter-spacing: 3px;">${otpCode}</p>
            <p style="font-size: 14px; color: #666; margin: 0;">Mã này có hiệu lực trong 10 phút</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" 
               style="background-color: #00A8CC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              ✅ Chấp nhận lời mời
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Lưu ý:</strong> Nếu bạn không nhận ra ${relativeName} hoặc không muốn chia sẻ thông tin, 
              hãy bỏ qua email này. Lời mời sẽ tự động hết hạn sau 7 ngày.
            </p>
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
    const response = await resend.emails.send(mailOptions);
    console.log('✅ Invite email sent:', response);
  } catch (error) {
    console.error('❌ Error sending invite email:', error);
    throw error;
  }
}

module.exports = { sendInviteEmail };
