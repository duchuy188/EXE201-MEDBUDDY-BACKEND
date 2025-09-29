
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT
const auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: 'No token provided' });
    // Nếu có tiền tố Bearer thì cắt ra, nếu không thì dùng luôn
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Lưu ý: payload có thể là { userId, role } hoặc { id, ... }
    const userId = decoded.userId || decoded.id || decoded._id;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account has been blocked' });
    }
    
    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
