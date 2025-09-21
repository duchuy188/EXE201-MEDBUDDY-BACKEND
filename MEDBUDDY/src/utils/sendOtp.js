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
    subject: 'Mã OTP xác thực đổi mật khẩu',
    text: `Mã OTP của bạn là: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendOtpEmail;
