const querystring = require('qs');
const crypto = require('crypto');
const moment = require('moment');

const vnp_TmnCode = process.env.VNPAY_TMN_CODE;
const vnp_HashSecret = process.env.VNPAY_HASH_SECRET;
const vnp_Url = process.env.VNPAY_URL;
const vnp_ReturnUrl = process.env.VNPAY_RETURN_URL;

exports.createPaymentUrl = async (req, res) => {
  try {
    const { amount, orderType, orderDescription, userId } = req.body;
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const date = moment();
    const orderId = date.format('HHmmss') + date.format('DDMMYYYY');
    const createDate = date.format('YYYYMMDDHHmmss');

    let vnp_Params = {
      'vnp_Version': '2.1.0',
      'vnp_Command': 'pay',
      'vnp_TmnCode': vnp_TmnCode,
      'vnp_Locale': 'vn',
      'vnp_CurrCode': 'VND',
      'vnp_TxnRef': orderId,
      'vnp_OrderInfo': orderDescription || `Thanh toán gói dịch vụ cho user ${userId}`,
      'vnp_OrderType': orderType || 'other',
      'vnp_Amount': amount * 100, // VNPay nhận đơn vị là VND * 100
      'vnp_ReturnUrl': vnp_ReturnUrl,
      'vnp_IpAddr': ipAddr,
      'vnp_CreateDate': createDate
    };

    vnp_Params = sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', vnp_HashSecret);
    const signed = hmac.update(signData).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    const paymentUrl = vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });
    return res.json({ paymentUrl });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi tạo link thanh toán VNPay', error: err.message });
  }
};

function sortObject(obj) {
  var sorted = {};
  var str = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (var i = 0; i < str.length; i++) {
    sorted[str[i]] = obj[decodeURIComponent(str[i])];
  }
  return sorted;
}
