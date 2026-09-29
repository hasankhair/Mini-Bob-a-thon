# 🌊 FloodWatch Malaysia

Real-time flood monitoring application for Malaysia with early warning alerts, Google Earth integration, and IBM Bob AI assistant.

## Features

- **Live flood map** — Google Maps/Earth overlay with flood zone markers for 8+ major rivers
- **Early flood warnings** — Forecasts 2–24 hours before floods reach populated areas
- **Real-time water levels** — Automatic refresh every 60 seconds
- **Status system** — Normal / Alert / Warning / Danger thresholds per river
- **Authentication** — Email/password registration + Google OAuth sign-in
- **MongoDB storage** — User credentials securely hashed with bcrypt
- **IBM Bob AI chat** — Ask flood-related questions powered by IBM Watson
- **Responsive dashboard** — Works on mobile and desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v5 (beta) |
| Database | MongoDB + Mongoose |
| Charts | Recharts |
| Map | Google Maps API + OpenStreetMap fallback |
| AI | IBM Bob (watsonx Assistant) |

## Setup

### 1. Clone and install

```bash
cd flood-malaysia
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
```env
MONGODB_URI=mongodb+srv://...         # Your MongoDB Atlas connection string
NEXTAUTH_SECRET=...                    # Random secret (use: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=...                   # From Google Cloud Console
GOOGLE_CLIENT_SECRET=...

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...   # Google Maps JavaScript API key
NEXT_PUBLIC_OPENWEATHER_API_KEY=...   # OpenWeatherMap API key

# IBM Bob / watsonx Assistant
NEXT_PUBLIC_IBM_BOB_INTEGRATION_ID=...
NEXT_PUBLIC_IBM_BOB_REGION=us-south
NEXT_PUBLIC_IBM_BOB_SERVICE_INSTANCE_ID=...
```

### 3. Set up MongoDB

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a database user and get the connection string
3. Whitelist your IP address (or use 0.0.0.0/0 for development)

### 4. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable "Google+ API" / "Google Identity"
3. Create OAuth 2.0 credentials
4. Add `http://localhost:3000/api/auth/callback/google` as authorized redirect URI

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data Sources

- **JPS Malaysia** (Jabatan Pengairan dan Saliran) — River level gauges
- **MetMalaysia** — Rainfall forecasts and weather data
- **NADMA** — National Disaster Management Agency alerts

## Emergency Contacts

| Service | Contact |
|---------|---------|
| Police / Fire / Ambulance | 999 |
| Civil Defence | 991 |
| NADMA | 03-8870 0200 |
| JPS Infoline | 1800-88-8325 |

## Project Structure

```
flood-malaysia/
├── app/
│   ├── page.tsx                    # Landing page (auth forms + hero)
│   ├── dashboard/page.tsx          # Main dashboard (map + charts + alerts)
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth handlers
│   │   ├── auth/register/          # User registration endpoint
│   │   └── flood/                  # Flood data API
│   └── layout.tsx
├── components/
│   ├── AuthForms.tsx               # Login + Register forms
│   ├── BobChatWidget.tsx           # IBM Bob AI chat widget
│   ├── FloodAlertCard.tsx          # River zone status card
│   ├── FloodMap.tsx                # Google Maps flood overlay
│   └── Providers.tsx               # NextAuth session provider
├── lib/
│   ├── floodData.ts                # Flood zones data + helpers
│   └── mongodb.ts                  # MongoDB connection utility
├── models/
│   └── User.ts                     # Mongoose user model
└── auth.ts                         # NextAuth configuration
```

## Deployment

Deploy to Vercel:

```bash
npx vercel --prod
```

Set all environment variables in the Vercel dashboard under Project Settings → Environment Variables.
