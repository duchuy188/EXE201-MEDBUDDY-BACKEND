const nodemailer = require('nodemailer');

// Hàm gửi email xác nhận liên kết
async function sendInviteEmail(toEmail, patientName, relativeName, confirmLink) {
  // Cấu hình transporter (ví dụ dùng Gmail, bạn cần thay đổi cho phù hợp)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // email gửi đi
      pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'MEDBUDDY - Xác nhận liên kết người thân',
    html: `<p>Xin chào ${patientName},</p>
      <p>${relativeName} muốn liên kết với bạn trên MEDBUDDY.</p>
      <p>Nhấn vào link sau để xác nhận liên kết:</p>
      <a href="${confirmLink}">${confirmLink}</a>
      <p>Nếu không phải bạn, hãy bỏ qua email này.</p>`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendInviteEmail };
