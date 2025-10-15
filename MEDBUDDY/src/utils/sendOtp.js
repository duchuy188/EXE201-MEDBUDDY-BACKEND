const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'HAP MEDBUDDY - Mã OTP đặt lại mật khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #00A8CC; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🔐 Đặt lại mật khẩu</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Xin chào,</p>
          
          <p style="font-size: 16px; color: #333;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên HAP MEDBUDDY.</p>
          
          <div style="background-color: #e8f4fd; border: 2px solid #00A8CC; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #00A8CC; margin-top: 0;">🔢 Mã OTP xác thực</h3>
            <p style="font-size: 32px; font-weight: bold; color: #00A8CC; margin: 15px 0; letter-spacing: 5px;">${otp}</p>
            <p style="font-size: 14px; color: #666; margin: 0;">Mã này có hiệu lực trong 5 phút</p>
          </div>
          
          <p style="font-size: 16px; color: #333;">Vui lòng nhập mã OTP này vào ứng dụng để tiếp tục quá trình đặt lại mật khẩu.</p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⚠️ Lưu ý bảo mật:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Không chia sẻ mã OTP này với bất kỳ ai</li>
                <li>Mã OTP chỉ có hiệu lực trong 5 phút</li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
              </ul>
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
    await transporter.sendMail(mailOptions);
    console.log('Forgot password OTP email sent to:', to);
  } catch (error) {
    console.error('Error sending forgot password OTP email:', error);
    throw error;
  }
}

module.exports = sendOtpEmail;
