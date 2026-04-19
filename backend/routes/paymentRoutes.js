import express from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/otherControllers.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
export default router;
