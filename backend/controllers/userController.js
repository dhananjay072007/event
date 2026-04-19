import jwt from 'jsonwebtoken';
import { ClientUser } from '../models/index.js';
import { sendWelcomeEmail } from '../services/emailService.js';

const generateToken = (id) => {
    return jwt.sign({ id, type: 'user' }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users/register
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone, city } = req.body;

        const existingUser = await ClientUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists' });
        }

        const user = await ClientUser.create({ name, email, password, phone, city });
        const token = generateToken(user._id);

        sendWelcomeEmail(user).catch(err => console.error('Welcome email failed:', err.message));

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, avatar: user.avatar }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/users/login
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await ClientUser.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email, phone: user.phone, city: user.city, avatar: user.avatar }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user profile
// @route   GET /api/users/me
export const getUserProfile = async (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.clientUser._id,
            name: req.clientUser.name,
            email: req.clientUser.email,
            phone: req.clientUser.phone,
            city: req.clientUser.city,
            avatar: req.clientUser.avatar,
            createdAt: req.clientUser.createdAt,
        }
    });
};

// @desc    Update user profile
// @route   PUT /api/users/me
export const updateUserProfile = async (req, res, next) => {
    try {
        const { name, phone, city, avatar } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (city !== undefined) updates.city = city;
        if (avatar !== undefined) updates.avatar = avatar;

        const user = await ClientUser.findByIdAndUpdate(req.clientUser._id, updates, { new: true, runValidators: true });

        res.json({
            success: true,
            message: 'Profile updated',
            data: {
                id: user._id, name: user.name, email: user.email,
                phone: user.phone, city: user.city, avatar: user.avatar,
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change user password
// @route   PATCH /api/users/change-password
export const changeUserPassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await ClientUser.findById(req.clientUser._id).select('+password');
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

// ==================== ADMIN ENDPOINTS ====================

// @desc    Get all users (admin)
// @route   GET /api/users/admin/all
export const getAllUsersAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await ClientUser.countDocuments(query);
        const users = await ClientUser.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: users,
            pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user stats (admin)
// @route   GET /api/users/admin/stats
export const getUserStatsAdmin = async (req, res, next) => {
    try {
        const total = await ClientUser.countDocuments();
        const active = await ClientUser.countDocuments({ isActive: true });
        const thisMonth = await ClientUser.countDocuments({
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        });
        const thisWeek = await ClientUser.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        res.json({
            success: true,
            data: { total, active, thisMonth, thisWeek }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user (admin)
// @route   GET /api/users/admin/:id
export const getUserAdmin = async (req, res, next) => {
    try {
        const user = await ClientUser.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle user active status (admin)
// @route   PATCH /api/users/admin/:id/toggle
export const toggleUserAdmin = async (req, res, next) => {
    try {
        const user = await ClientUser.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/admin/:id
export const deleteUserAdmin = async (req, res, next) => {
    try {
        const user = await ClientUser.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};
