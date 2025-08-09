const admin = require('firebase-admin');

// Tạo service account object từ environment variables
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Hàm gửi notification tới 1 thiết bị
async function sendNotification(registrationToken, title, body) {
  const message = {
    notification: {
      title,
      body
    },
    token: registrationToken
  };
  try {
    const response = await admin.messaging().send(message);
    console.log('Gửi thành công:', response);
    return response;
  } catch (error) {
    console.error('Gửi thất bại:', error);
    throw error;
  }
}

// Ví dụ sử dụng:
// const token = 'DEVICE_FCM_TOKEN';
// sendNotification(token, 'Nhắc nhở uống thuốc', 'Đã đến giờ uống thuốc, bạn nhớ uống đúng giờ nhé!');

module.exports = { sendNotification };
