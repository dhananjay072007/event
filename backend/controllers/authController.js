import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// @desc    Login admin
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// @desc    Register first admin (one-time setup)
// @route   POST /api/auth/setup
export const setupAdmin = async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      return res.status(403).json({ success: false, message: 'Setup already completed' });
    }

    const { name, email, password } = req.body;
    const admin = await User.create({ name, email, password, role: 'superadmin' });
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: { token, user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PATCH /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
