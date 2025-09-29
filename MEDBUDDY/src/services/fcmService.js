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

// Hàm gửi notification tới 1 thiết bị, hỗ trợ truyền tên file âm thanh
async function sendNotification(registrationToken, title, body, sound = "default", channelId) {
  const soundName = sound.endsWith('.mp3') ? sound.replace('.mp3', '') : sound;
  let channelIdAuto = channelId;
  if (!channelIdAuto) {
    channelIdAuto = soundName + '_channel';
  }
  const dataPayload = { sound: String(soundName) };
  if (channelIdAuto) dataPayload.channel_id = String(channelIdAuto);
  const androidNotification = { sound: soundName };
  if (channelIdAuto) androidNotification.channel_id = String(channelIdAuto);
  const message = {
    token: registrationToken,
    notification: { title, body },
    data: dataPayload,
    android: {
      notification: androidNotification
    },
    apns: { payload: { aps: { sound: soundName } } }
  };
  console.log('[FCM PAYLOAD]', JSON.stringify(message, null, 2)); // Log chi tiết payload FCM
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
