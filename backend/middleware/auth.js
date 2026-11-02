const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Please log in' });
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Account not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
};

exports.requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).json({ message: `Only ${role}s can do this` });
  next();
};
