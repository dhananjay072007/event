// authRoutes.js
import express from 'express';
import { login, getMe, setupAdmin, changePassword, createAdmin, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { loginValidation } from '../middlewares/validationMiddleware.js';

const router = express.Router();
router.post('/login', loginValidation, login);
router.post('/setup', setupAdmin);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, changePassword);
router.post('/create-admin', protect, adminOnly, createAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
