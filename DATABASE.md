# Database Documentation
## E-Commerce Platform — MySQL 8

**Database**: `ecommerce_db`  
**Charset**: `utf8mb4`  
**Collation**: `utf8mb4_unicode_ci`

---

## Entity Relationship Overview

```
users
 ├── addresses         (user_id FK)
 ├── carts             (user_id FK)
 ├── wishlists         (user_id FK)
 ├── reviews           (user_id FK)
 └── orders            (user_id FK)
       └── order_items (order_id FK)

products
 ├── product_images    (product_id FK)
 ├── product_variants  (product_id FK)
 ├── carts             (product_id FK)
 ├── wishlists         (product_id FK)
 ├── reviews           (product_id FK)
 ├── order_items       (product_id FK)
 ├── categories        (category_id FK)
 └── brands            (brand_id FK)

coupons
 └── orders            (coupon_id FK)
```

---

## Table Schemas

### `users`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | auto increment |
| name | varchar(255) | |
| email | varchar(255) | unique |
| email_verified_at | timestamp | nullable |
| password | varchar(255) | bcrypt hashed |
| phone | varchar(255) | nullable |
| avatar | varchar(255) | nullable, file path |
| role | enum | customer, admin, super_admin — default: customer |
| is_active | tinyint(1) | default: 1 |
| remember_token | varchar(100) | nullable |
| created_at / updated_at | timestamp | |

---

### `brands`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| name | varchar(255) | |
| slug | varchar(255) | unique |
| logo | varchar(255) | nullable |
| description | text | nullable |
| is_active | tinyint(1) | default: 1 |
| created_at / updated_at | timestamp | |

---

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| name | varchar(255) | |
| slug | varchar(255) | unique |
| parent_id | bigint unsigned FK | nullable → categories.id |
| image | varchar(255) | nullable |
| description | text | nullable |
| sort_order | int | default: 0 |
| is_active | tinyint(1) | default: 1 |
| created_at / updated_at | timestamp | |

**Self-referencing**: `parent_id` enables nested categories (e.g. Electronics → Phones → Smartphones).

---

### `products`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| name | varchar(255) | |
| slug | varchar(255) | unique |
| short_description | text | nullable |
| description | longtext | nullable, HTML content |
| price | decimal(10,2) | selling price |
| compare_price | decimal(10,2) | nullable, original price for strikethrough |
| sku | varchar(255) | nullable, unique |
| stock | int | default: 0 |
| low_stock_threshold | int | default: 5, triggers admin alert |
| category_id | bigint unsigned FK | nullable → categories.id |
| brand_id | bigint unsigned FK | nullable → brands.id |
| weight | decimal(8,2) | nullable, in kg |
| dimensions | json | nullable, {length, width, height} |
| is_featured | tinyint(1) | default: 0 |
| is_active | tinyint(1) | default: 1 |
| views_count | int | default: 0 |
| created_at / updated_at | timestamp | |

---

### `product_images`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| product_id | bigint unsigned FK | → products.id, cascade delete |
| image_path | varchar(255) | storage path |
| alt_text | varchar(255) | nullable |
| sort_order | int | default: 0 |
| is_primary | tinyint(1) | default: 0, one primary per product |
| created_at / updated_at | timestamp | |

---

### `product_variants`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| product_id | bigint unsigned FK | → products.id, cascade delete |
| name | varchar(255) | e.g. "Red / XL" |
| sku | varchar(255) | nullable, unique |
| price | decimal(10,2) | nullable, overrides product price |
| stock | int | default: 0 |
| attributes | json | e.g. {"color": "Red", "size": "XL"} |
| image | varchar(255) | nullable |
| is_active | tinyint(1) | default: 1 |
| created_at / updated_at | timestamp | |

---

### `addresses`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | bigint unsigned FK | → users.id, cascade delete |
| name | varchar(255) | recipient name |
| phone | varchar(255) | |
| address_line_1 | varchar(255) | |
| address_line_2 | varchar(255) | nullable |
| city | varchar(255) | |
| state | varchar(255) | |
| zip_code | varchar(255) | |
| country | varchar(255) | default: 'BD' |
| is_default | tinyint(1) | default: 0 |
| created_at / updated_at | timestamp | |

---

### `carts`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | bigint unsigned FK | nullable → users.id (guest support) |
| session_id | varchar(255) | nullable, indexed, for guest carts |
| product_id | bigint unsigned FK | → products.id, cascade delete |
| product_variant_id | bigint unsigned FK | nullable → product_variants.id |
| quantity | int | default: 1 |
| created_at / updated_at | timestamp | |

**Index**: `(user_id, product_id)` for fast lookup.

---

### `coupons`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| code | varchar(255) | unique, case-insensitive in app |
| type | enum | percentage, fixed |
| value | decimal(10,2) | % or fixed BDT amount |
| min_order_amount | decimal(10,2) | default: 0 |
| max_discount_amount | decimal(10,2) | nullable, cap for percentage type |
| max_uses | int | nullable, null = unlimited |
| used_count | int | default: 0 |
| max_uses_per_user | int | default: 1 |
| starts_at | timestamp | nullable |
| expires_at | timestamp | nullable |
| is_active | tinyint(1) | default: 1 |
| created_at / updated_at | timestamp | |

---

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | bigint unsigned FK | → users.id, restrict delete |
| order_number | varchar(255) | unique, e.g. ORD-20260503-0001 |
| status | enum | pending, processing, shipped, delivered, cancelled, refunded |
| subtotal | decimal(10,2) | before discount |
| discount_amount | decimal(10,2) | default: 0 |
| shipping_fee | decimal(10,2) | default: 0 |
| tax_amount | decimal(10,2) | default: 0 |
| total | decimal(10,2) | final amount |
| coupon_id | bigint unsigned FK | nullable → coupons.id |
| coupon_code | varchar(255) | nullable, snapshot at time of order |
| payment_method | enum | cod, stripe, bkash, nagad |
| payment_status | enum | pending, paid, failed, refunded |
| payment_intent_id | varchar(255) | nullable, Stripe payment intent |
| shipping_address | json | snapshot of address at order time |
| notes | text | nullable, customer notes |
| delivered_at | timestamp | nullable |
| created_at / updated_at | timestamp | |

**Note**: `shipping_address` is stored as JSON snapshot so the order record stays accurate even if the user later edits their address.

---

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| order_id | bigint unsigned FK | → orders.id, cascade delete |
| product_id | bigint unsigned FK | → products.id, restrict delete |
| product_variant_id | bigint unsigned FK | nullable → product_variants.id |
| product_name | varchar(255) | snapshot at time of order |
| variant_name | varchar(255) | nullable, snapshot |
| product_image | varchar(255) | nullable, snapshot |
| quantity | int | |
| unit_price | decimal(10,2) | price at time of order |
| total | decimal(10,2) | quantity × unit_price |
| created_at / updated_at | timestamp | |

**Note**: Product name, image, and price are snapshotted so order history is accurate even after product edits.

---

### `reviews`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| product_id | bigint unsigned FK | → products.id, cascade delete |
| user_id | bigint unsigned FK | → users.id, cascade delete |
| order_id | bigint unsigned FK | nullable → orders.id |
| rating | tinyint unsigned | 1–5 |
| title | varchar(255) | nullable |
| comment | text | nullable |
| is_approved | tinyint(1) | default: 0, admin must approve |
| created_at / updated_at | timestamp | |

**Unique**: `(product_id, user_id, order_id)` — one review per purchase.

---

### `wishlists`
| Column | Type | Notes |
|---|---|---|
| id | bigint unsigned PK | |
| user_id | bigint unsigned FK | → users.id, cascade delete |
| product_id | bigint unsigned FK | → products.id, cascade delete |
| created_at / updated_at | timestamp | |

**Unique**: `(user_id, product_id)` — no duplicates.

---

## System Tables (Laravel auto-managed)

| Table | Purpose |
|---|---|
| `migrations` | Migration history |
| `personal_access_tokens` | Sanctum API tokens |
| `password_reset_tokens` | Password reset links |
| `sessions` | User sessions (if session driver = DB) |
| `cache` / `cache_locks` | Laravel cache store |
| `jobs` / `failed_jobs` / `job_batches` | Queue workers |

---

## Migration Order (dependency sequence)

```
1. users
2. cache, jobs                    (no FK deps)
3. personal_access_tokens         (no FK deps)
4. brands                         (no FK deps)
5. categories                     (self-referencing parent_id)
6. products                       (FK: categories, brands)
7. product_variants               (FK: products)
8. product_images                 (FK: products)
9. addresses                      (FK: users)
10. coupons                       (no FK deps)
11. carts                         (FK: users, products, product_variants)
12. orders                        (FK: users, coupons)
13. order_items                   (FK: orders, products, product_variants)
14. reviews                       (FK: products, users, orders)
15. wishlists                     (FK: users, products)
```
