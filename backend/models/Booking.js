import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [3, 'Name must be at least 3 characters'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        eventType: {
            type: String,
            required: [true, 'Event type is required'],
            enum: {
                values: [
                    'Wedding',
                    'Corporate Event',
                    'Birthday Party',
                    'Anniversary',
                    'Engagement',
                    'Baby Shower',
                    'Conference',
                    'Product Launch',
                    'Concert',
                    'Other',
                ],
                message: '{VALUE} is not a supported event type',
            },
        },
        date: {
            type: Date,
            required: [true, 'Event date is required'],
            validate: {
                validator: function (val) {
                    return val > new Date();
                },
                message: 'Event date must be in the future',
            },
        },
        budget: {
            type: Number,
            min: [0, 'Budget cannot be negative'],
        },
        message: {
            type: String,
            minlength: [10, 'Message must be at least 10 characters'],
        },
        status: {
            type: String,
            enum: {
                values: ['pending', 'confirmed', 'cancelled', 'completed'],
                message: '{VALUE} is not a valid status',
            },
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: {
                values: ['unpaid', 'partial', 'paid'],
                message: '{VALUE} is not a valid payment status',
            },
            default: 'unpaid',
        },
        paymentId: {
            type: String,
            default: null,
        },
        razorpayOrderId: {
            type: String,
            default: null,
        },
        advanceAmount: {
            type: Number,
            default: 0,
            min: [0, 'Advance amount cannot be negative'],
        },
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
// Prevent duplicate bookings for the same phone + date combination
bookingSchema.index({ phone: 1, date: 1 }, { unique: true });
// Common query patterns
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);