# TableNest — Full Stack Restaurant Management SaaS

A complete, production-ready SaaS platform for restaurant management built with React + TypeScript (frontend) and NestJS + MongoDB (backend).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| State | Zustand + TanStack Query |
| Charts | Recharts |
| Icons | Lucide React |
| Font | Poppins (Google Fonts) |
| Backend | NestJS + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (7-day expiry) |
| Real-time | Socket.IO |
| File Uploads | Multer |

---

## Project Structure

```
tablenest/
├── frontend/          # React + TypeScript + Vite
│   └── src/
│       ├── modules/
│       │   ├── admin/       # Super Admin platform
│       │   ├── owner/       # Restaurant Owner platform
│       │   ├── customer/    # Customer platform
│       │   └── public/      # Public pages
│       ├── shared/          # Reusable components, hooks, types
│       ├── services/        # API service layer (axios)
│       └── store/           # Zustand auth store
└── backend/           # NestJS + MongoDB
    └── src/
        ├── modules/         # Feature modules
        │   ├── auth/        # JWT authentication
        │   ├── users/       # User management
        │   ├── restaurants/ # Restaurant CRUD
        │   ├── menu/        # Menu & categories
        │   ├── tables/      # Floor plan & tables
        │   ├── reservations/# Booking system
        │   ├── orders/      # Order management
        │   ├── reviews/     # Reviews & ratings
        │   ├── notifications/# Push notifications
        │   ├── loyalty/     # Points system
        │   ├── referrals/   # Referral program
        │   ├── inventory/   # Stock management
        │   ├── staff/       # Staff management
        │   ├── promotions/  # Promo codes & discounts
        │   ├── support/     # Support tickets
        │   └── analytics/   # Dashboard metrics
        └── seed.ts          # Database seeder
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

Create `backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/tablenest
JWT_SECRET=tablenest_super_secret_key_2024_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Seed Database

```bash
cd backend
npx ts-node -r tsconfig-paths/register src/seed.ts
```

### 4. Start Development

**Terminal 1 — Backend:**
```bash
cd backend
npm run start:dev
# Runs on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@tablenest.com | admin123 |
| Restaurant Owner | owner@tablenest.com | owner123 |
| Customer | customer@tablenest.com | customer123 |

---

## Platform Modules

### Super Admin
- **Dashboard** — Platform KPIs, bar/line/donut charts, restaurant table
- **Restaurant Management** — CRUD, approve/reject/suspend
- **Pending Approvals** — Review new restaurant applications
- **User Management** — All users, roles, suspend/activate
- **Orders** — Platform-wide order oversight
- **Bookings** — All reservations
- **Reports** — Revenue trend, daily orders, user signups (charts)
- **Complaints** — Support ticket management with status workflow
- **Settings** — Platform config, maintenance mode

### Restaurant Owner
- **Dashboard** — Revenue bar chart, reservations heatmap, kitchen queue, live floor plan, recent feedback
- **Menu Management** — Categories sidebar + item cards with availability toggles
- **Reservation Calendar** — Month/Week/Day calendar + day detail sidebar
- **Seat Management** — Visual floor plan with colored status indicators
- **Kitchen Display** — Live order board (KDS) with 4-column status pipeline
- **Staff Management** — Team CRUD with role assignment
- **Inventory Management** — Stock tracking with low-stock alerts
- **Promotions** — Create/manage discount offers with modal
- **QR Code Manager** — Per-table QR generation with color customization
- **Analytics** — Revenue area chart, orders bar chart, top items, customer breakdown
- **Reviews** — Rating distribution, review list, owner reply
- **Settings** — Profile, notification preferences

### Customer
- **Home** — Welcome banner, quick stats, cuisine filters, restaurant grid
- **Browse** — Grid/list view, search, cuisine & price filters
- **Restaurant Detail** — Menu browser with cart, table booking with floor plan
- **Order Tracking** — Live status timeline + driver info panel
- **Order History** — Filter tabs, reorder, track, write review
- **My Bookings** — Upcoming/Past/Cancelled with modify/cancel
- **Notifications** — Tabbed by type, mark read, clear
- **Favorites** — Saved restaurants grid
- **Referrals** — Referral code, 3-step guide, history table
- **Rewards** — Points balance, tier progress, reward redemption, transaction history
- **Account Settings** — Profile, password, notification toggles, danger zone
- **Addresses & Payments** — Address CRUD, payment card management

### Public
- **Landing Page** — Hero search, features, how it works, featured restaurants, cuisines, testimonials, CTA
- **Login / Register** — Split layout with restaurant imagery
- **Forgot/Reset Password** — With strength meter
- **404** — On-brand error page with chef illustration
- **Partner Registration** — 4-step wizard for restaurant owners

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
PATCH  /api/auth/change-password
GET    /api/auth/me

GET    /api/users
PUT    /api/users/profile
GET    /api/restaurants/public
GET    /api/restaurants/pending
POST   /api/restaurants
PATCH  /api/restaurants/:id/approve
PATCH  /api/restaurants/:id/suspend

GET    /api/menu/restaurant/:id
POST   /api/menu/items
PATCH  /api/menu/items/:id/toggle

GET    /api/tables/floor-plan/:restaurantId
PATCH  /api/tables/:id/status

GET    /api/orders/my-orders
POST   /api/orders
PATCH  /api/orders/:id/status

GET    /api/reservations/my-reservations
POST   /api/reservations
PATCH  /api/reservations/:id/confirm

GET    /api/notifications
PATCH  /api/notifications/mark-all-read

GET    /api/analytics/platform-overview
GET    /api/analytics/restaurant/:id/dashboard

GET    /api/support
POST   /api/support
PATCH  /api/support/:id/status

# ... and 40+ more endpoints
```

---

## Design System

```
Primary:    #B91C1C  (TableNest Red)
Dark:       #991B1B
Light:      #FEE2E2
Background: #FAF7F5
Dark Footer:#1F1F1F
Success:    #16A34A
Warning:    #D97706
Danger:     #DC2626

Font: Poppins (300, 400, 500, 600, 700, 800)
```

---

## Production Deployment

```bash
# Build frontend
cd frontend && npm run build
# Output: frontend/dist/

# Build backend
cd backend && npx tsc -p tsconfig.json
# Output: backend/dist/

# Start production
cd backend && node dist/main.js
```

For MongoDB Atlas, update `MONGODB_URI` in `.env`.