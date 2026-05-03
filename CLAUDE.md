# CLAUDE.md — E-Commerce Project Guide

## Project Overview
Full-stack e-commerce platform with customer storefront and admin panel.
- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS) — `E:\ecommerce\frontend`
- **Backend**: Laravel 12 (REST API) — `E:\ecommerce\backend`
- **Database**: MySQL 8 via XAMPP — database: `ecommerce_db`

## Running the Project

### Backend
```bash
cd E:\ecommerce\backend
php artisan serve          # runs on http://localhost:8000
php artisan queue:work     # for background jobs (emails, etc.)
```

### Frontend
```bash
cd E:\ecommerce\frontend
npm run dev                # runs on http://localhost:3000
```

### Database
Start MySQL via XAMPP Control Panel before running the backend.
```bash
# Re-run migrations from scratch
php artisan migrate:fresh --seed
# Run pending migrations only
php artisan migrate
```

## Key Environment Variables

### Backend (`backend/.env`)
```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_db
DB_USERNAME=root
DB_PASSWORD=
```

### Frontend (`frontend/.env.local`) — create this file
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Project Structure

### Backend (`backend/`)
```
app/
  Http/
    Controllers/
      Auth/           # AuthController
      Store/          # Storefront controllers
      Admin/          # Admin-only controllers
    Middleware/
      AdminMiddleware.php
  Models/             # Eloquent models
  Services/           # Business logic (future)
database/
  migrations/         # All DB migrations
  seeders/            # Test data seeders
routes/
  api.php             # All API routes
```

### Frontend (`frontend/src/`)
```
app/
  (store)/            # Customer-facing pages
  admin/              # Admin panel pages
components/
  store/              # Storefront components
  admin/              # Admin components
  ui/                 # Shared UI primitives
hooks/                # Custom React hooks
lib/
  api.ts              # Axios instance
  auth.ts             # Auth helpers
store/                # Zustand state stores
types/                # TypeScript interfaces
```

## API Conventions
- Base URL: `http://localhost:8000/api`
- All responses: `{ success: boolean, message: string, data: any }`
- Auth: Bearer token via `Authorization` header (Laravel Sanctum)
- Admin routes: prefixed with `/admin`, require `role` = admin or super_admin
- Pagination: `?page=1&per_page=16`

## Auth Flow
1. User logs in → Laravel returns Sanctum token
2. Token stored in `localStorage` as `auth_token`
3. Axios interceptor attaches token to every request
4. On 401 response → token cleared, redirect to `/auth/login`

## User Roles
| Role | Access |
|---|---|
| `customer` | Storefront only |
| `admin` | Admin panel + storefront |
| `super_admin` | Full access including user management |

## Common Artisan Commands
```bash
php artisan make:model ModelName -mrc   # model + migration + controller
php artisan make:seeder SeederName
php artisan db:seed
php artisan route:list                  # see all API routes
php artisan cache:clear
php artisan config:clear
```

## Code Conventions
- Controllers return JSON only — no Blade views
- Use Form Requests for validation (not inline `$request->validate()`)
- Models use `$fillable`, not `$guarded`
- Frontend: all API calls go through `src/lib/api.ts` axios instance
- Frontend: server state via React Query, client state via Zustand
- No comments unless the WHY is non-obvious
