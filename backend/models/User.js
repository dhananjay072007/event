import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: {
                values: ['admin', 'superadmin'],
                message: 'Role must be either admin or superadmin',
            },
            default: 'admin',
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        // ── Session invalidation ───────────────────────────────────────────────
        // Embedded in every JWT. protect() middleware compares token's value
        // against this. Increment on: logout, password change, deactivation.
        tokenVersion: {
            type: Number,
            default: 0,
            select: false,
        },

        // ── Password reset ─────────────────────────────────────────────────────
        resetToken: {
            type: String,
            select: false,
        },
        resetTokenExpiry: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

// ── Hooks ──────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// ── Instance methods ───────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Rotate tokenVersion — instantly invalidates all existing JWTs for this user.
 * Call on: logout, password change, account deactivation.
 */
userSchema.methods.invalidateSessions = async function () {
    this.tokenVersion = (this.tokenVersion ?? 0) + 1;
    await this.save();
};

export const User = mongoose.model('User', userSchema);