import mongoose from 'mongoose';

export const GALLERY_CATEGORIES = [
    'Wedding',
    'Corporate',
    'Birthday',
    'Anniversary',
    'Conference',
    'Concert',
    'Other',
];

const gallerySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [2, 'Title must be at least 2 characters'],
        },
        imageUrl: {
            type: String,
            required: [true, 'Image URL is required'],
        },
        publicId: {
            type: String,
            required: [true, 'Cloudinary public ID is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: {
                values: GALLERY_CATEGORIES,
                message: '{VALUE} is not a valid gallery category',
            },
            default: 'Other',
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        isFeatured: {
            type: Boolean,
            default: false,
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
gallerySchema.index({ category: 1, order: 1 });
gallerySchema.index({ isFeatured: 1 });

export const Gallery = mongoose.model('Gallery', gallerySchema);