import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

// Routes
import bookingRoutes from './routes/bookingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Security Middlewares
app.use(helmet());
app.use(mongoSanitize());

// CORS
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'EventPro API is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/users', userRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 EventPro Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
