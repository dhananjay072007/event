import express from 'express';
import { getPricingPlans, getPricingPlansAdmin, createPricingPlan, updatePricingPlan, deletePricingPlan } from '../controllers/otherControllers.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/', getPricingPlans);
router.get('/admin', protect, adminOnly, getPricingPlansAdmin);
router.post('/', protect, adminOnly, createPricingPlan);
router.put('/:id', protect, adminOnly, updatePricingPlan);
router.delete('/:id', protect, adminOnly, deletePricingPlan);
export default router;
