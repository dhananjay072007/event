import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
        },
        role: {
            type: String,
            trim: true,
            default: '',
        },
        text: {
            type: String,
            required: [true, 'Testimonial text is required'],
            minlength: [10, 'Testimonial must be at least 10 characters'],
        },
        rating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
            default: 5,
        },
        image: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
testimonialSchema.index({ isActive: 1, order: 1 });

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);