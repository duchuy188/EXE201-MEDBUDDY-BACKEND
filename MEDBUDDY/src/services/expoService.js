const fetch = require('node-fetch');

// Hàm gửi notification tới thiết bị Expo
async function sendExpoNotification(expoPushToken, title, body, data) {
  if (!expoPushToken) throw new Error('Missing Expo push token');
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title: title || 'Test Notification',
      body: body || 'Hello from backend 🚀',
      data: data || { screen: 'Home' },
    }),
  });
  return await response.json();
}

// Ví dụ sử dụng:
// const expoToken = 'ExponentPushToken[xxxxxx]';
// sendExpoNotification(expoToken, 'Backend Test', 'Xin chào từ server Node.js', { screen: 'Profile' });

module.exports = { sendExpoNotification };
