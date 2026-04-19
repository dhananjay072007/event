import express from 'express';
import {
    registerUser, loginUser, getUserProfile, updateUserProfile, changeUserPassword,
    getAllUsersAdmin, getUserStatsAdmin, getUserAdmin, toggleUserAdmin, deleteUserAdmin
} from '../controllers/userController.js';
import { protect, adminOnly, userProtect } from '../middlewares/authMiddleware.js';
import { userRegisterValidation, userLoginValidation } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Public user auth
router.post('/register', userRegisterValidation, registerUser);
router.post('/login', userLoginValidation, loginUser);

// Authenticated user routes
router.get('/me', userProtect, getUserProfile);
router.put('/me', userProtect, updateUserProfile);
router.patch('/change-password', userProtect, changeUserPassword);

// Admin routes (must come after /me to avoid conflicts)
router.get('/admin/stats', protect, adminOnly, getUserStatsAdmin);
router.get('/admin/all', protect, adminOnly, getAllUsersAdmin);
router.get('/admin/:id', protect, adminOnly, getUserAdmin);
router.patch('/admin/:id/toggle', protect, adminOnly, toggleUserAdmin);
router.delete('/admin/:id', protect, adminOnly, deleteUserAdmin);

export default router;
