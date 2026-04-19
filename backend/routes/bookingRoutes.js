import express from 'express';
import { createBooking, getAllBookings, getBooking, updateBooking, deleteBooking, getBookingStats, getMyBookings, checkAvailability } from '../controllers/bookingController.js';
import { protect, adminOnly, userProtect } from '../middlewares/authMiddleware.js';
import { bookingValidation } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.get('/check-availability', checkAvailability);
router.post('/', bookingValidation, createBooking);
router.get('/my', userProtect, getMyBookings);
router.get('/', protect, adminOnly, getAllBookings);
router.get('/stats', protect, adminOnly, getBookingStats);
router.get('/:id', protect, adminOnly, getBooking);
router.patch('/:id', protect, adminOnly, updateBooking);
router.delete('/:id', protect, adminOnly, deleteBooking);

export default router;
