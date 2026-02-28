const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
