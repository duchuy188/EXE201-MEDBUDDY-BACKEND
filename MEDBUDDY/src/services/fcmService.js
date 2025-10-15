const admin = require('firebase-admin');
const NotificationToken = require('../models/NotificationToken');

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

    // Normalize possible error code locations
    const errCode = error.code || (error.errorInfo && error.errorInfo.code);

    // If token is not registered anymore or invalid, remove it from DB to avoid future failures
    const removableCodes = ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'];
    try {
      if (removableCodes.includes(errCode)) {
        // Attempt to remove the invalid token from NotificationToken collection
        const deleteResult = await NotificationToken.findOneAndDelete({ deviceToken: registrationToken });
        if (deleteResult) {
          console.log('[FCM] Removed invalid device token from DB:', registrationToken);
        } else {
          console.log('[FCM] Invalid device token not found in DB (could be already removed):', registrationToken);
        }

        // Don't throw error for not-registered tokens; caller can treat null/undefined response as failure
        return null;
      }
    } catch (cleanupErr) {
      console.error('[FCM] Error while cleaning up invalid token:', cleanupErr);
      // fallthrough to rethrow original error
    }

    throw error;
  }
}

// Ví dụ sử dụng:
// const token = 'DEVICE_FCM_TOKEN';
// sendNotification(token, 'Nhắc nhở uống thuốc', 'Đã đến giờ uống thuốc, bạn nhớ uống đúng giờ nhé!');

module.exports = { sendNotification };
