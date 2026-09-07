# TableNest

TableNest is a full-stack restaurant discovery, reservation, food ordering, and restaurant management platform.

The project is split into two applications:

- `frontend`: React, TypeScript, Vite, React Router, React Query, Zustand, and Recharts.
- `backend`: NestJS, TypeScript, MongoDB, Mongoose, JWT authentication, file uploads, and Socket.IO support.

## Features

### Customers

- Discover active restaurants.
- Search and filter restaurants by name, cuisine, city, country, price range, and rating.
- View restaurant details, menus, images, ratings, and availability.
- Make reservations.
- Create and track food orders.
- View order history and delivery status.
- Save favorite restaurants.
- Manage addresses and payment methods.
- Manage notification preferences.
- Earn loyalty points and use referrals.
- Receive notifications and support updates.

### Restaurant owners

- Register a restaurant partner account.
- Upload restaurant photos and select a cover image.
- Publish restaurant information including cuisine, location, capacity, services, and pricing.
- Manage menus and menu categories.
- Manage inventory.
- Manage reservations and tables.
- Monitor kitchen orders.
- Manage restaurant staff.
- Manage promotions and QR codes.
- Review analytics, orders, ratings, and customer activity.
- Update restaurant settings.

### Platform capabilities

- JWT-based authentication with customer and owner roles.
- MongoDB persistence through Mongoose.
- Request validation using NestJS `ValidationPipe`, `class-validator`, and `class-transformer`.
- Password hashing with `bcryptjs`.
- Static image serving from the backend uploads directory.
- Frontend development proxy for API and uploaded image requests.
- Security headers with Helmet.
- API rate limiting.
- CORS configuration for local frontend development.
- Responsive public, customer, and owner interfaces.

## Project structure

```text
.
├── backend/
│   ├── src/
│   │   ├── common/
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── analytics/
│   │   │   ├── auth/
│   │   │   ├── inventory/
│   │   │   ├── loyalty/
│   │   │   ├── menu/
│   │   │   ├── messages/
│   │   │   ├── notifications/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── promotions/
│   │   │   ├── qrcodes/
│   │   │   ├── referrals/
│   │   │   ├── reservations/
│   │   │   ├── restaurants/
│   │   │   ├── reviews/
│   │   │   ├── staff/
│   │   │   ├── support/
│   │   │   ├── tables/
│   │   │   ├── uploads/
│   │   │   └── users/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── uploads/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── customer/
│   │   │   ├── owner/
│   │   │   └── public/
│   │   ├── shared/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Requirements

Install the following before starting the project:

- Node.js 20 or newer recommended.
- npm 10 or newer recommended.
- MongoDB 7 or newer recommended.
- Git, if cloning the repository.

MongoDB must be running locally or be available through a remote connection string.

## Installation

From the project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

On Windows PowerShell, the same commands are:

```powershell
Set-Location backend
npm install

Set-Location ../frontend
npm install
```

## Environment configuration

Create the backend environment file from the example:

```bash
cd backend
cp .env.example .env
```

On Windows PowerShell:

```powershell
Set-Location backend
Copy-Item .env.example .env
```

The backend `.env` file contains:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/tablenest
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Backend HTTP port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/tablenest` |
| `JWT_SECRET` | Secret used to sign access tokens | Development fallback exists, but set this explicitly |
| `JWT_EXPIRES_IN` | Intended token lifetime configuration | `7d` |
| `NODE_ENV` | Runtime environment name | `development` |

Do not commit a real `.env` file or production secrets.

## Running the applications

Run the backend and frontend in separate terminals.

### Backend

```bash
cd backend
npm run start:dev
```

The API is available at:

```text
http://localhost:3001/api
```

### Frontend

```bash
cd frontend
npm run dev
```

The web application is available at:

```text
http://localhost:5173
```

The Vite development server proxies these paths to the backend:

- `/api` -> `http://localhost:3001/api`
- `/uploads` -> `http://localhost:3001/uploads`

## Production build and start

### Backend

```bash
cd backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

The frontend production output is generated in `frontend/dist`.

For production deployment, configure the frontend server to route API requests to the deployed backend and serve uploaded files from a persistent storage location. Do not rely on local disk storage for production uploads unless the deployment environment provides persistent volumes.

## Frontend routes

### Public routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/restaurants` | Public restaurant browser |
| `/browse` | Compatibility alias for the restaurant browser |
| `/restaurants/:id` | Restaurant details, menu, and booking tabs |
| `/login` | Customer or owner login |
| `/register` | Customer registration |
| `/partner/register` | Restaurant owner registration |
| `/forgot-password` | Request password reset |
| `/reset-password` | Reset a password |
| `/about-us` | About page |
| `/faq` | Frequently asked questions |

### Customer routes

Customer routes require an authenticated user with the `customer` role.

| Route | Purpose |
| --- | --- |
| `/home` | Customer dashboard |
| `/my-orders` | Order history |
| `/my-orders/:id/track` | Order tracking |
| `/my-bookings` | Reservations |
| `/notifications` | Customer notifications |
| `/favorites` | Favorite restaurants |
| `/referrals` | Referral program |
| `/rewards` | Loyalty rewards |
| `/settings` | Account settings |
| `/settings/addresses` | Addresses and payment methods |

### Owner routes

Owner routes require an authenticated user with the `owner` role.

| Route | Purpose |
| --- | --- |
| `/owner/dashboard` | Restaurant dashboard |
| `/owner/menu` | Menu management |
| `/owner/reservations` | Reservation calendar |
| `/owner/seats` | Table and seating management |
| `/owner/kitchen` | Kitchen display |
| `/owner/staff` | Staff management |
| `/owner/inventory` | Inventory management |
| `/owner/promotions` | Promotions |
| `/owner/qrcodes` | QR code management |
| `/owner/analytics` | Restaurant analytics |
| `/owner/reviews` | Review management |
| `/owner/settings` | Owner settings |

## API overview

All backend routes use the `/api` prefix.

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/register-owner
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/change-password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

Authenticated requests use:

```http
Authorization: Bearer <access-token>
```

### Restaurants

```text
GET    /api/restaurants/public
GET    /api/restaurants/public/:id
GET    /api/restaurants/my-restaurant
GET    /api/restaurants/:id
POST   /api/restaurants
PUT    /api/restaurants/:id
```

`GET /api/restaurants/public` supports public search and filtering query parameters such as:

```text
?page=1&limit=12
?search=french
?cuisine=Italian
?city=Kigali
?country=Rwanda
?priceRange=$$
?sort=rating_asc
?sort=newest
?sort=name_asc
```

Public restaurant results include active restaurants and their `images` array. Restaurant photos uploaded through the owner registration flow are stored in `backend/uploads` and are served through `/uploads/<filename>`.

### Other API modules

The backend also provides routes for:

- `/api/users`
- `/api/menu`
- `/api/tables`
- `/api/reservations`
- `/api/orders`
- `/api/payments`
- `/api/promotions`
- `/api/reviews`
- `/api/notifications`
- `/api/messages`
- `/api/loyalty`
- `/api/referrals`
- `/api/inventory`
- `/api/staff`
- `/api/analytics`
- `/api/support`
- `/api/uploads`

Use the corresponding controller under `backend/src/modules` as the source of truth for request bodies, permissions, and response shapes.

## Restaurant photos and uploads

The owner registration flow uploads images before creating the restaurant:

1. The frontend sends each image to `POST /api/uploads/image`.
2. The backend validates the file type and 5 MB size limit.
3. The file is saved in `backend/uploads`.
4. The API returns a URL such as `/uploads/123-image.jpg`.
5. The frontend stores those URLs in the restaurant `images` array.
6. The restaurant is created with the first image also used as its `logo`.
7. The public browser displays `images[0]` as the restaurant card image.

Allowed image types:

- JPEG
- PNG
- GIF
- WebP
- SVG

Maximum image size: 5 MB per image.

The multiple-upload endpoint is also available:

```text
POST /api/uploads/images
```

It accepts up to 10 image files in the `files` field.

## Database and seed data

The application uses MongoDB through Mongoose. The default database name is `tablenest`.

The backend includes seed files and a seed script:

```bash
cd backend
npm run seed
```

Before running the seed command, confirm that:

- MongoDB is running.
- `backend/.env` contains the correct `MONGODB_URI`.
- The seed data is appropriate for the current database.

## Validation and security

The backend configures:

- Global request validation with whitelisting.
- Rejection of non-whitelisted request properties.
- Implicit DTO transformation.
- Helmet security headers.
- CORS for local frontend ports `5173` and `3000`.
- Rate limiting of 200 requests per 15-minute window.
- JWT authentication for protected routes.
- Role guards for customer and owner access.
- MongoDB ID validation for ID parameters.
- Path traversal protection when deleting uploaded files.

For production, replace development secrets, restrict CORS to deployed origins, use HTTPS, and configure persistent object storage for uploaded media.

## Available commands

### Backend commands

Run these from `backend`:

```bash
npm run start          # Start the backend
npm run start:dev      # Start with watch mode
npm run start:debug    # Start with the debugger and watch mode
npm run start:prod     # Run the compiled backend
npm run build          # Compile the backend
npm run lint           # Run ESLint
npm run format         # Format TypeScript files
npm run test           # Run unit tests
npm run test:watch     # Run unit tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests
npm run seed           # Seed the database
```

### Frontend commands

Run these from `frontend`:

```bash
npm run dev            # Start Vite development server
npm run build          # Type-check and create a production build
npm run lint           # Run ESLint
npm run preview        # Preview the production build
```

## Testing and verification

Recommended verification sequence:

```bash
cd backend
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run lint -- --no-fix

cd ../frontend
npm run lint
npm run build
```

The e2e test requires a working MongoDB connection because it exercises the public restaurant API.

## Troubleshooting

### MongoDB connection errors

Confirm that MongoDB is running and that the URI in `backend/.env` is correct:

```text
MONGODB_URI=mongodb://localhost:27017/tablenest
```

### Frontend cannot reach the API

Confirm that:

- The backend is running on port `3001`.
- The frontend is running on port `5173`.
- The frontend is using the Vite proxy in `frontend/vite.config.ts`.
- Requests use `/api/...` rather than a hard-coded unavailable host.

### Restaurant does not appear in Browse Restaurants

Public browse results return active restaurants only. Confirm that:

- The restaurant creation request succeeded.
- The API response contains `status: "active"`.
- The API response contains an `images` array when photos were uploaded.
- The uploaded file still exists in `backend/uploads`.
- The browser is using the correct `/uploads/<filename>` URL.

### Uploaded image is broken

Confirm that the backend serves static uploads and that the frontend proxy contains:

```ts
'/uploads': { target: 'http://localhost:3001', changeOrigin: true }
```

Also confirm that the returned image URL begins with `/uploads/` and is not a local filesystem path.

### Port already in use

Stop the process using port `3001` or `5173`, or change the backend `PORT` and the frontend proxy target together.

### Authentication redirects to login

Protected routes require a valid JWT and the correct role. Log in again and confirm that the browser has a valid `token` value in local storage.

## Development notes

- Keep frontend and backend changes scoped to their respective applications.
- Preserve existing public route names when adding navigation links.
- Use the existing API service in `frontend/src/shared/services/api.ts` for backend requests.
- Add new backend features as NestJS modules under `backend/src/modules`.
- Keep uploaded files out of source control when they are generated at runtime.
- Do not commit secrets or production database credentials.
- Run lint and build checks before submitting changes.

## License

The backend package is currently marked as private and unlicensed. Add a project license before distributing TableNest publicly.
