import express from 'express';
import { getServices, getService, getServicesAdmin, createService, updateService, deleteService } from '../controllers/otherControllers.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/', getServices);
router.get('/admin', protect, adminOnly, getServicesAdmin);
router.get('/:slug', getService);
router.post('/', protect, adminOnly, createService);
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);
export default router;
