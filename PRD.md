# Product Requirements Document (PRD)
## E-Commerce Platform

**Version**: 1.0  
**Date**: 2026-05-03  
**Stack**: Next.js 14 + Laravel 12 + MySQL

---

## 1. Product Vision
A full-featured online store that lets customers browse products, manage a cart, and place orders — with a complete admin panel to manage the entire business operation.

---

## 2. User Roles

| Role | Description |
|---|---|
| Guest | Can browse products, view categories, search |
| Customer | Registered user — can order, review, manage account |
| Admin | Manages products, orders, customers, coupons |
| Super Admin | Full access including admin user management |

---

## 3. Feature Requirements

### 3.1 Customer Storefront

#### Authentication
- [x] Register with name, email, password
- [x] Login / Logout
- [ ] Email verification
- [ ] Forgot password / reset via email
- [ ] Social login (Google) — future

#### Product Discovery
- [x] Homepage with hero banner, featured products, categories
- [x] Product listing with filters (category, brand, price range, rating)
- [x] Sort by: newest, price low-high, price high-low, popularity
- [x] Full-text product search
- [x] Product detail page with image gallery
- [x] Product variants (size, color, etc.)
- [x] Related products
- [ ] Recently viewed products — future

#### Shopping Cart
- [x] Add/remove/update quantity
- [x] Persistent cart for logged-in users (DB)
- [x] Guest cart (localStorage), merge on login
- [x] Apply coupon code
- [x] Real-time subtotal calculation

#### Checkout
- [x] Shipping address form (new or saved)
- [x] Select payment method (COD, Stripe)
- [x] Order summary review before placing
- [x] Place order → redirect to success page
- [ ] Stripe payment integration — Phase 2

#### Order Management
- [x] View order history
- [x] Order detail with status timeline
- [x] Order status: Pending → Processing → Shipped → Delivered
- [ ] Cancel order (if still pending)
- [ ] Request refund — future

#### Account
- [x] Edit profile (name, phone, avatar)
- [x] Manage saved addresses
- [x] Wishlist (save products for later)
- [x] Submit product reviews (only after purchase)
- [ ] Change password

---

### 3.2 Admin Panel

#### Dashboard
- [x] KPI cards: total revenue, orders, customers, products
- [x] Sales chart (last 30 days)
- [x] Recent orders list
- [x] Low stock alerts
- [ ] Top selling products widget

#### Product Management
- [x] List all products with search and filters
- [x] Create / Edit / Delete product
- [x] Upload multiple product images (set primary)
- [x] Manage product variants (size/color with individual stock & price)
- [x] Bulk actions (activate, deactivate, delete)
- [ ] Import products via CSV — future

#### Category & Brand Management
- [x] Nested categories (parent → child)
- [x] CRUD for brands
- [x] Upload category/brand images

#### Order Management
- [x] List orders with filters (status, date, customer)
- [x] View order details
- [x] Update order status
- [x] Print invoice / packing slip — future

#### Customer Management
- [x] List all customers
- [x] View customer order history
- [x] Activate / deactivate account

#### Coupon Management
- [x] Create percentage or fixed-amount coupons
- [x] Set min order, max uses, expiry date
- [x] View usage statistics

#### Reviews
- [x] View all submitted reviews
- [x] Approve / reject reviews
- [x] Delete reviews

#### Reports
- [x] Sales by date range
- [x] Top products by revenue
- [ ] Revenue by category — future
- [ ] Customer acquisition report — future

---

## 4. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page load time | < 2 seconds (LCP) |
| API response time | < 300ms for most endpoints |
| Mobile responsive | Yes — mobile-first design |
| Security | HTTPS, Sanctum auth, input validation, XSS/CSRF protection |
| Uptime | 99.9% (production) |

---

## 5. Out of Scope (v1.0)
- Mobile app
- Multi-vendor marketplace
- Subscription / recurring orders
- Multi-currency / multi-language
- Live chat support

---

## 6. Release Phases

| Phase | Features | Timeline |
|---|---|---|
| Phase 1 | Auth, Products, Cart, Orders (COD), Admin panel | Weeks 1–8 |
| Phase 2 | Stripe payments, Reviews, Coupons, Reports | Weeks 9–12 |
| Phase 3 | Performance, SEO, deployment | Weeks 13–14 |
