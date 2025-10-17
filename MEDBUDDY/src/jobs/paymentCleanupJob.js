const cron = require('node-cron');
const Payment = require('../models/Payment');

// Auto-expire PayOS PENDING payments older than 20 minutes
// Runs every minute in Vietnam timezone
cron.schedule('* * * * *', async() => {
    try {
        const cutoff = new Date(Date.now() - 20 * 60 * 1000); // 20 minutes ago

        const result = await Payment.updateMany({
            status: 'PENDING',
            createdAt: { $lte: cutoff },
        }, {
            $set: {
                status: 'EXPIRED',
                expiredAt: new Date(),
            },
        });

        if (result && (result.modifiedCount || result.nModified)) {
            console.log(`[PAYMENT-JOB] Expired ${result.modifiedCount || result.nModified} pending payments older than 20 minutes.`);
        }
    } catch (error) {
        console.error('[PAYMENT-JOB] Error expiring pending payments:', error && (error.stack || error.message || error));
    }
}, {
    scheduled: true,
    timezone: 'Asia/Ho_Chi_Minh',
});