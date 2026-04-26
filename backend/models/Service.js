import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Service title is required'],
            trim: true,
            minlength: [3, 'Title must be at least 3 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        shortDescription: {
            type: String,
            trim: true,
            default: '',
        },
        image: {
            type: String,
            default: '',
        },
        imagePublicId: {
            type: String,
            default: '',
        },
        icon: {
            type: String,
            default: '🎉',
        },
        features: [
            {
                type: String,
                trim: true,
            },
        ],
        startingPrice: {
            type: Number,
            min: [0, 'Starting price cannot be negative'],
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
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isActive: 1, order: 1 });

export const Service = mongoose.model('Service', serviceSchema);