// authRoutes.js
import express from 'express';
import { login, getMe, setupAdmin, changePassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { loginValidation } from '../middlewares/validationMiddleware.js';

const router = express.Router();
router.post('/login', loginValidation, login);
router.post('/setup', setupAdmin);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, changePassword);

export default router;
