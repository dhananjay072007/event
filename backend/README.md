# EventPro Backend

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

## First Time Setup (Create Admin)
```bash
POST /api/auth/setup
{ "name": "Admin", "email": "admin@eventpro.com", "password": "yourpassword" }
```

## Deploy to Render / Railway
- Set all environment variables from `.env.example`
- Start command: `node server.js`
