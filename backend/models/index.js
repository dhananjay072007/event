import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ==================== USER/ADMIN MODEL ====================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

// ==================== BOOKING MODEL ====================
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, minlength: [3, 'Name must be at least 3 characters'] },
  phone: {
    type: String, required: [true, 'Phone is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
  },
  email: {
    type: String, required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  eventType: {
    type: String, required: [true, 'Event type is required'],
    enum: ['Wedding', 'Corporate Event', 'Birthday Party', 'Anniversary', 'Engagement', 'Baby Shower', 'Conference', 'Product Launch', 'Concert', 'Other']
  },
  date: {
    type: Date, required: [true, 'Event date is required'],
    validate: {
      validator: function (val) { return val > new Date(); },
      message: 'Event date must be in the future'
    }
  },
  budget: { type: Number, min: [0, 'Budget cannot be negative'] },
  message: { type: String, minlength: [10, 'Message must be at least 10 characters'] },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  paymentId: { type: String },
  razorpayOrderId: { type: String },
  advanceAmount: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

// Prevent duplicate bookings (same date + phone)
bookingSchema.index({ phone: 1, date: 1 }, { unique: true });

export const Booking = mongoose.model('Booking', bookingSchema);

// ==================== CONTACT MODEL ====================
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  phone: { type: String },
  subject: { type: String },
  message: { type: String, required: true, minlength: 10 },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Contact = mongoose.model('Contact', contactSchema);

// ==================== BLOG MODEL ====================
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  content: { type: String, required: true },
  excerpt: { type: String, maxlength: 300 },
  image: { type: String },
  imagePublicId: { type: String },
  category: { type: String, default: 'General' },
  tags: [{ type: String }],
  author: { type: String, default: 'EventPro Team' },
  isPublished: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  metaTitle: { type: String },
  metaDescription: { type: String },
}, { timestamps: true });

export const Blog = mongoose.model('Blog', blogSchema);

// ==================== GALLERY MODEL ====================
const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  category: {
    type: String, required: true,
    enum: ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Conference', 'Concert', 'Other'],
    default: 'Other'
  },
  description: { type: String },
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const Gallery = mongoose.model('Gallery', gallerySchema);

// ==================== SERVICE MODEL ====================
const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  image: { type: String },
  imagePublicId: { type: String },
  icon: { type: String, default: '🎉' },
  features: [{ type: String }],
  startingPrice: { type: Number },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const Service = mongoose.model('Service', serviceSchema);

// ==================== TESTIMONIAL MODEL ====================
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, trim: true },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// ==================== SITE SETTINGS MODEL ====================
const siteSettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'EventPro' },
  tagline: { type: String, default: '' },
  ownerName: { type: String, default: '' },
  ownerPhone: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  address: { type: String, default: '' },
  workingHours: { type: String, default: '' },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  stats: {
    eventsCompleted: { type: String, default: '' },
    clientSatisfaction: { type: String, default: '' },
    yearsExperience: { type: String, default: '' },
    teamMembers: { type: String, default: '' },
  },
  heroSlides: [{
    title: { type: String },
    subtitle: { type: String },
    image: { type: String },
    tag: { type: String },
  }],
  aboutText: { type: String, default: '' },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
}, { timestamps: true });

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

// ==================== PRICING PLAN MODEL ====================
const pricingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String },
  features: [{ type: String }],
  tag: { type: String },
  ctaText: { type: String, default: 'Get Started' },
  ctaLink: { type: String, default: '/booking' },
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const PricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);

// ==================== CLIENT USER MODEL ====================
const clientUserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  phone: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

clientUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

clientUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const ClientUser = mongoose.model('ClientUser', clientUserSchema);
