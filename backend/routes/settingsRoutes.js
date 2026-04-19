import express from 'express';
import { getSettings, updateSettings } from '../controllers/otherControllers.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/', getSettings);
router.put('/', protect, adminOnly, updateSettings);
export default router;
