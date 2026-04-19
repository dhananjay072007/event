import jwt from 'jsonwebtoken';
import { User, ClientUser } from '../models/index.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    next(error);
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
    return next();
  }
  res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
};

// Middleware for client (public) users
export const userProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only allow user-type tokens
    if (decoded.type !== 'user') {
      return res.status(401).json({ success: false, message: 'Invalid token type.' });
    }

    const user = await ClientUser.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account not found or deactivated.' });
    }

    req.clientUser = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }
    next(error);
  }
};
