import { Booking } from '../models/index.js';
import { sendBookingConfirmation, sendBookingStatusUpdate } from '../services/emailService.js';

// @desc    Check date availability
// @route   GET /api/bookings/check-availability
export const checkAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const checkDate = new Date(date);
    if (isNaN(checkDate)) return res.status(400).json({ success: false, message: 'Invalid date format' });

    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] },
    }).select('eventType status date');

    const totalSlotsPerDay = 3;
    const bookedSlots = existingBookings.length;
    const available = bookedSlots < totalSlotsPerDay;

    res.json({
      success: true,
      data: {
        date: req.query.date,
        available,
        totalSlots: totalSlotsPerDay,
        bookedSlots,
        remainingSlots: Math.max(0, totalSlotsPerDay - bookedSlots),
        existingEvents: existingBookings.map(b => ({ eventType: b.eventType, status: b.status })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create booking
// @route   POST /api/bookings
export const createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create(req.body);

    // Non-blocking email
    sendBookingConfirmation(booking).catch(err =>
      console.error('Booking confirmation email failed:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully! We will contact you within 24 hours.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my bookings (logged-in user by email match)
// @route   GET /api/bookings/my
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ email: req.clientUser.email })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status / notes / advance
// @route   PATCH /api/bookings/:id
export const updateBooking = async (req, res, next) => {
  try {
    const { status, notes, advanceAmount } = req.body;

    // Only update fields that were actually provided
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (advanceAmount !== undefined) updates.advanceAmount = advanceAmount;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided to update' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Send status update email for relevant transitions
    if (status && ['confirmed', 'cancelled', 'completed'].includes(status)) {
      sendBookingStatusUpdate(booking).catch(err =>
        console.error('Status update email failed:', err.message)
      );
    }

    res.json({ success: true, message: 'Booking updated', data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking stats
// @route   GET /api/bookings/stats
export const getBookingStats = async (req, res, next) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
        },
      },
    ]);

    const total = await Booking.countDocuments();
    const thisMonth = await Booking.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    res.json({ success: true, data: { stats, total, thisMonth } });
  } catch (error) {
    next(error);
  }
};