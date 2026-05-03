# TODO — E-Commerce Platform
**Last updated**: 2026-05-03

Legend: ✅ Done | 🔄 In Progress | ⬜ Not Started | 🚫 Blocked

---

## Phase 1 — Foundation

### Project Setup
- ✅ Laravel 12 backend scaffolded (`E:\ecommerce\backend`)
- ✅ Next.js 14 frontend scaffolded (`E:\ecommerce\frontend`)
- ✅ MySQL database `ecommerce_db` created
- ✅ All 16 migrations written and run (22 tables)
- ✅ Laravel Sanctum installed and published
- ✅ Frontend dependencies installed (axios, React Query, Zustand, etc.)
- ✅ CLAUDE.md, PRD.md, ARCHITECTURE.md, DATABASE.md, TODO.md created
- ⬜ Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL`
- ⬜ Configure CORS in `config/cors.php`

### Backend — Models & Relationships
- 🔄 User model (update with role, phone, avatar, relationships)
- 🔄 Brand model
- 🔄 Category model (with self-referencing parent/children)
- 🔄 Product model (with accessors, relationships)
- 🔄 ProductImage model
- 🔄 ProductVariant model
- 🔄 Address model
- 🔄 Cart model
- 🔄 Coupon model
- 🔄 Order model
- 🔄 OrderItem model
- 🔄 Review model
- 🔄 Wishlist model

### Backend — Auth
- 🔄 AuthController: register, login, logout, me
- ⬜ Forgot password email
- ⬜ Password reset
- ⬜ Email verification

### Backend — Store API Routes
- 🔄 GET /products (list with filters, search, pagination)
- 🔄 GET /products/{slug} (detail + increment views)
- 🔄 GET /categories (tree)
- 🔄 GET /categories/{slug}
- 🔄 GET/POST/PUT/DELETE /cart
- 🔄 POST /orders (place order)
- 🔄 GET /orders (user order history)
- 🔄 GET /orders/{number}
- 🔄 POST /coupons/validate
- 🔄 POST /reviews
- 🔄 GET/POST /wishlist
- 🔄 GET/PUT /profile
- 🔄 CRUD /profile/addresses

### Backend — Admin API Routes
- 🔄 GET /admin/stats (dashboard)
- 🔄 CRUD /admin/products
- 🔄 POST /admin/products/{id}/images
- 🔄 CRUD /admin/categories
- 🔄 CRUD /admin/brands
- 🔄 GET/PUT /admin/orders
- 🔄 GET /admin/customers
- 🔄 CRUD /admin/coupons
- 🔄 GET/PUT/DELETE /admin/reviews
- 🔄 GET /admin/reports/sales
- 🔄 GET /admin/reports/top-products

### Backend — Middleware
- 🔄 AdminMiddleware (check role)
- ⬜ Register AdminMiddleware in bootstrap/app.php

---

## Phase 2 — Frontend Storefront

### Core Setup
- 🔄 `src/lib/api.ts` — Axios instance with interceptors
- 🔄 `src/lib/auth.ts` — token helpers
- 🔄 `src/types/index.ts` — all TypeScript interfaces
- 🔄 `src/store/authStore.ts` — Zustand auth store
- 🔄 `src/store/cartStore.ts` — Zustand cart store
- 🔄 `src/hooks/useAuth.ts`

### Layout & Shared Components
- 🔄 Root `app/layout.tsx` (QueryClientProvider, Toaster)
- 🔄 Store layout with Navbar + Footer
- 🔄 `components/store/Navbar.tsx` (cart badge, user menu)
- 🔄 `components/store/Footer.tsx`
- 🔄 `components/store/ProductCard.tsx`
- ⬜ `components/ui/Button.tsx`
- ⬜ `components/ui/Input.tsx`
- ⬜ `components/ui/Spinner.tsx`
- ⬜ `components/ui/Modal.tsx`

### Pages
- 🔄 Homepage (`app/(store)/page.tsx`)
- 🔄 Product listing (`app/(store)/products/page.tsx`)
- 🔄 Product detail (`app/(store)/products/[slug]/page.tsx`)
- 🔄 Cart (`app/(store)/cart/page.tsx`)
- 🔄 Checkout (`app/(store)/checkout/page.tsx`)
- ⬜ Checkout success page
- 🔄 Login (`app/(store)/auth/login/page.tsx`)
- 🔄 Register (`app/(store)/auth/register/page.tsx`)
- ⬜ Order history (`app/(store)/orders/page.tsx`)
- ⬜ Order detail (`app/(store)/orders/[number]/page.tsx`)
- ⬜ Account profile page
- ⬜ Wishlist page
- ⬜ Search results page
- ⬜ Category listing page

---

## Phase 3 — Admin Panel

### Layout & Navigation
- 🔄 Admin layout with sidebar (`app/admin/layout.tsx`)
- 🔄 Sidebar navigation component

### Admin Pages
- 🔄 Dashboard (`app/admin/dashboard/page.tsx`)
- ⬜ Product list + CRUD pages
- ⬜ Product image upload UI
- ⬜ Product variant manager
- ⬜ Category list + CRUD
- ⬜ Brand list + CRUD
- ⬜ Order list + detail + status update
- ⬜ Customer list + detail
- ⬜ Coupon list + CRUD
- ⬜ Reviews moderation
- ⬜ Sales report with chart
- ⬜ Top products report

---

## Phase 4 — Integrations & Polish

### Payments
- ⬜ Stripe integration (backend: create payment intent)
- ⬜ Stripe Elements on checkout page (frontend)
- ⬜ Webhook handler for payment confirmation

### Email Notifications
- ⬜ Configure Mailtrap for local email testing
- ⬜ Order confirmation email (queued job)
- ⬜ Order status update email
- ⬜ Password reset email

### File Storage
- ⬜ Configure Laravel storage for product images
- ⬜ `php artisan storage:link` for public disk
- ⬜ Image validation (mime, size) in controllers

### Seeders & Test Data
- ⬜ UserSeeder (admin user + sample customers)
- ⬜ BrandSeeder
- ⬜ CategorySeeder
- ⬜ ProductSeeder (with images + variants)
- ⬜ CouponSeeder
- ⬜ OrderSeeder

---

## Phase 5 — Deployment

- ⬜ Production `.env` config
- ⬜ Deploy frontend to Vercel
- ⬜ Deploy backend to Railway / DigitalOcean
- ⬜ Configure production MySQL
- ⬜ Set up Cloudflare CDN
- ⬜ Configure S3 for file storage in production
- ⬜ Enable HTTPS everywhere
- ⬜ Performance audit (Lighthouse)

---

## Known Issues / Blockers

| Issue | Status | Notes |
|---|---|---|
| `product_images` migration timestamp conflict | ✅ Fixed | Renamed to `_212821_` to run after `products` |
| Laravel 13 requires PHP 8.3, installed PHP 8.2 | ✅ Handled | Using Laravel 12 instead |

---

## Next Immediate Steps
1. Wait for background agents to finish creating Models + Controllers + Frontend pages
2. Create `frontend/.env.local`
3. Run `php artisan storage:link`
4. Create admin seeder and seed a test admin user
5. Test auth endpoints with Postman
6. Start dev servers and verify homepage loads
