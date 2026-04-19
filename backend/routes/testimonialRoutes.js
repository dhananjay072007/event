import express from 'express';
import { getTestimonials, getTestimonialsAdmin, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/otherControllers.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/', getTestimonials);
router.get('/admin', protect, adminOnly, getTestimonialsAdmin);
router.post('/', protect, adminOnly, createTestimonial);
router.put('/:id', protect, adminOnly, updateTestimonial);
router.delete('/:id', protect, adminOnly, deleteTestimonial);
export default router;
