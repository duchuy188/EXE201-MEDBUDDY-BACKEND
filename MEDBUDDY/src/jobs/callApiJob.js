const cron = require('node-cron');
const axios = require('axios');

// Cron pattern: every 10 minutes
// You can override the target URL with env var CRON_TARGET_URL
const TARGET_URL = process.env.CRON_TARGET_URL || 'https://httpbin.org/get';

const callApiJob = cron.schedule('*/10 * * * *', async () => {
  try {
    const now = new Date();
    console.log(`🔄 [CALL-API-JOB] ${now.toISOString()} - Gọi API: ${TARGET_URL}`);

    const resp = await axios.get(TARGET_URL, { timeout: 15000 });

    console.log(`✅ [CALL-API-JOB] Status: ${resp.status} - ${resp.statusText}`);
    // Nếu cần log body nhỏ gọn để debug, có thể mở lại dòng dưới
    // console.log('Response data:', resp.data);
  } catch (err) {
    console.error('❌ [CALL-API-JOB] Lỗi khi gọi API:', err.message);
  }
}, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

const startCallApiJob = () => {
  console.log('🚀 [CALL-API-JOB] Starting call-api job (every 10 minutes)...');
  callApiJob.start();
  console.log('✅ [CALL-API-JOB] Started');
};

const stopCallApiJob = () => {
  console.log('🛑 [CALL-API-JOB] Stopping call-api job...');
  callApiJob.stop();
  console.log('✅ [CALL-API-JOB] Stopped');
};

module.exports = {
  callApiJob,
  startCallApiJob,
  stopCallApiJob
};
