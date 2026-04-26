# 🎉 Shiv Event Management — Full-Stack Event Management Platform

A production-ready MERN stack event management platform with admin dashboard, booking system, blog, gallery, and Razorpay payments.

---

## 📁 Project Structure

```
event-management/
├── backend/          # Node.js + Express + MongoDB
└── frontend/         # React + Vite + Tailwind CSS
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in MongoDB URI, JWT secret, Cloudinary, Razorpay, Email keys
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

### 3. Create Admin Account (first time only)

```bash
POST http://localhost:5000/api/auth/setup
Body: { "name": "Admin", "email": "admin@yoursite.com", "password": "StrongPass123" }
```

---

## 🔑 Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_HOST` | SMTP host (e.g. smtp.gmail.com) |
| `EMAIL_USER` | SMTP email address |
| `EMAIL_PASS` | SMTP app password |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `FRONTEND_URL` | Your deployed frontend URL |

### Frontend `.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## 📌 API Endpoints

### Public
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking |
| POST | `/api/contact` | Submit contact form |
| GET | `/api/blogs` | List published blogs |
| GET | `/api/blogs/:slug` | Single blog |
| GET | `/api/gallery` | Gallery images |
| GET | `/api/services` | Services list |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |

### Admin (JWT required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/bookings` | All bookings (paginated) |
| PATCH | `/api/bookings/:id` | Update booking status |
| DELETE | `/api/bookings/:id` | Delete booking |
| GET | `/api/contact` | All messages |
| POST | `/api/blogs` | Create blog |
| PUT | `/api/blogs/:id` | Update blog |
| DELETE | `/api/blogs/:id` | Delete blog |
| POST | `/api/gallery` | Upload gallery image |
| DELETE | `/api/gallery/:id` | Delete image |
| POST | `/api/services` | Create service |

---

## 🚢 Deployment

### Backend → Render / Railway
1. Push backend to GitHub
2. Create new Web Service on Render
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add all environment variables

### Frontend → Vercel
1. Push frontend to GitHub
2. Import to Vercel
3. Set `VITE_API_URL` to your Render backend URL
4. Deploy

### Database → MongoDB Atlas
1. Create free cluster
2. Whitelist `0.0.0.0/0` for Render/Railway
3. Copy connection string to `MONGODB_URI`

---

## 🛡️ Security Features

- JWT authentication with expiry
- bcrypt password hashing
- Helmet.js secure headers
- Rate limiting (100 req/15min global, 10/15min for auth)
- MongoDB injection sanitization
- CORS configured
- File upload validation (type + size)
- Input validation on all endpoints

---

## 💳 Razorpay Payment Flow

1. Client calls `POST /api/payments/create-order` with `bookingId` + `amount`
2. Frontend opens Razorpay checkout
3. On success, client calls `POST /api/payments/verify` with signature
4. Backend verifies HMAC signature
5. Booking status updated to `confirmed`, paymentStatus to `paid`

---

Built with ❤️ — Shiv Event Management
