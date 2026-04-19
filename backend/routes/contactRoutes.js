import express from 'express';
import { createContact, getAllContacts, markContactRead, deleteContact } from '../controllers/otherControllers.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';
import { contactValidation } from '../middlewares/validationMiddleware.js';

const router = express.Router();
router.post('/', contactValidation, createContact);
router.get('/', protect, adminOnly, getAllContacts);
router.patch('/:id/read', protect, adminOnly, markContactRead);
router.delete('/:id', protect, adminOnly, deleteContact);
export default router;
