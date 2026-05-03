# Architecture Document
## E-Commerce Platform

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                              │
│   ┌─────────────────────────┐  ┌──────────────────────────┐ │
│   │    Customer Storefront   │  │       Admin Panel        │ │
│   │    Next.js 14 (SSR/ISR)  │  │   Next.js 14 (CSR)       │ │
│   │    localhost:3000        │  │   localhost:3000/admin   │ │
│   └────────────┬────────────┘  └─────────────┬────────────┘ │
└────────────────┼─────────────────────────────┼──────────────┘
                 │  HTTP/JSON (Axios)           │
                 ▼                              ▼
┌──────────────────────────────────────────────────────────────┐
│                        API LAYER                             │
│                                                              │
│              Laravel 12 REST API                             │
│              localhost:8000/api                              │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │   Auth   │  │  Store   │  │  Admin   │  │  Queue   │   │
│   │ Routes   │  │  Routes  │  │  Routes  │  │  Worker  │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│   Middleware: Sanctum Auth │ AdminMiddleware │ CORS          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │      MySQL 8        │
                    │   ecommerce_db      │
                    │   (XAMPP locally)   │
                    └─────────────────────┘
```

---

## Frontend Architecture

### Rendering Strategy
| Page | Strategy | Reason |
|---|---|---|
| Homepage | ISR (revalidate: 60s) | Mostly static, needs freshness |
| Product listing | SSR | Dynamic filters in URL params |
| Product detail | SSR | Real-time stock, SEO critical |
| Cart / Checkout | CSR | User-specific, no SEO needed |
| Account pages | CSR | Private pages |
| Admin panel | CSR | Private, no SEO needed |

### State Management
```
┌─────────────────────────────────────────────────┐
│                State Architecture                │
│                                                  │
│  Server State (React Query / TanStack Query)     │
│  ├── Products, Categories, Brands               │
│  ├── Orders, Reviews                            │
│  └── Admin data (stats, reports)               │
│                                                  │
│  Client State (Zustand)                          │
│  ├── authStore: user, token, isLoading          │
│  └── cartStore: items, totalItems, totalPrice   │
└─────────────────────────────────────────────────┘
```

### Directory Structure
```
frontend/src/
├── app/
│   ├── (store)/                  # Route group — storefront
│   │   ├── layout.tsx            # Navbar + Footer
│   │   ├── page.tsx              # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx          # Product listing
│   │   │   └── [slug]/page.tsx   # Product detail
│   │   ├── category/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx          # Order history
│   │   │   └── [number]/page.tsx # Order detail
│   │   └── auth/
│   │       ├── login/page.tsx
│   │       └── register/page.tsx
│   └── admin/                    # Admin panel
│       ├── layout.tsx            # Sidebar layout
│       ├── dashboard/page.tsx
│       ├── products/
│       ├── orders/
│       ├── customers/
│       ├── categories/
│       ├── brands/
│       ├── coupons/
│       └── reviews/
├── components/
│   ├── store/                    # Storefront components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── Filters.tsx
│   │   └── ReviewCard.tsx
│   ├── admin/                    # Admin components
│   │   ├── Sidebar.tsx
│   │   ├── StatsCard.tsx
│   │   └── DataTable.tsx
│   └── ui/                       # Shared primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Spinner.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
├── lib/
│   ├── api.ts                    # Axios instance
│   └── auth.ts                   # Token helpers
├── store/
│   ├── authStore.ts              # Zustand auth state
│   └── cartStore.ts              # Zustand cart state
└── types/
    └── index.ts                  # All TypeScript interfaces
```

---

## Backend Architecture

### Request Lifecycle
```
Request → routes/api.php → Middleware Stack → Controller → Model → Response
                              │
                   ┌──────────▼──────────┐
                   │  1. CORS            │
                   │  2. auth:sanctum    │
                   │  3. AdminMiddleware │
                   └─────────────────────┘
```

### Controller Organization
```
app/Http/Controllers/
├── Auth/
│   └── AuthController.php        # register, login, logout, me
├── Store/
│   ├── ProductController.php     # index, show
│   ├── CategoryController.php    # index, show
│   ├── CartController.php        # index, store, update, destroy
│   ├── OrderController.php       # index, store, show
│   ├── ReviewController.php      # store
│   ├── WishlistController.php    # index, toggle
│   ├── CouponController.php      # validate
│   └── ProfileController.php    # show, update, addresses
└── Admin/
    ├── DashboardController.php   # stats
    ├── ProductController.php     # full CRUD + image upload
    ├── CategoryController.php    # full CRUD
    ├── BrandController.php       # full CRUD
    ├── OrderController.php       # index, show, updateStatus
    ├── CustomerController.php    # index, show, toggleStatus
    ├── CouponController.php      # full CRUD
    ├── ReviewController.php      # index, approve, destroy
    └── ReportController.php      # salesByDate, topProducts
```

### Model Relationships
```
User ──────< Order >────── OrderItem >──── Product
  │                                          │
  ├──< Address                               ├──< ProductImage
  ├──< Cart >──── Product                   ├──< ProductVariant
  ├──< Wishlist >── Product                 ├──> Category
  └──< Review >─── Product                 └──> Brand
```

---

## API Design

### Response Format
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": { ... }
}
```

### Error Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Authentication
- Library: Laravel Sanctum (token-based for SPA)
- Token storage: `localStorage` key `auth_token`
- Header: `Authorization: Bearer {token}`
- Admin check: `role` column on `users` table (admin | super_admin)

---

## Security

| Concern | Mitigation |
|---|---|
| CSRF | Sanctum token auth (stateless API — no cookie sessions) |
| XSS | React escapes by default; never use `dangerouslySetInnerHTML` |
| SQL Injection | Eloquent ORM with parameterized queries |
| Mass Assignment | All models use `$fillable` |
| Unauthorized access | `auth:sanctum` middleware + `AdminMiddleware` |
| Sensitive data | Passwords hashed with bcrypt (12 rounds) |
| File uploads | Validate mime type + size in controller |

---

## Local Development Ports

| Service | Port | URL |
|---|---|---|
| Next.js (frontend) | 3000 | http://localhost:3000 |
| Laravel (backend) | 8000 | http://localhost:8000 |
| MySQL (XAMPP) | 3306 | — |
| phpMyAdmin | 80 | http://localhost/phpmyadmin |
