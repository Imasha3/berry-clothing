# Berry Clothing

Berry Clothing is a submission-ready frontend demo for a fashion ecommerce store with a public storefront, customer account area, and mock admin panel. The current build keeps all business flows on mock data so the team can present the experience safely before connecting live services.

## Project Overview

This project is built to demonstrate:

- A public shopping experience with category browsing, product detail pages, cart, and checkout
- A customer account area with order history and order tracking
- An admin panel with mock role-based access, product management, order management, inventory monitoring, reports, and settings
- Supabase-backed data and authentication with Cloudinary media storage

## Main Features

- Product listing with filters, sorting, and mock category deep links
- Product details with multiple images, colors, sizes, quantity selector, and add-to-cart flow
- Cart UI with quantity updates and checkout entry point
- Checkout with mock payment methods:
  - Cash on Delivery
  - Bank Transfer
  - Bank Deposit
  - Online Card Payment mock screen
- Bank deposit receipt upload UI
- Login-required guard before checkout and account access
- Customer account dashboard, orders, and tracking
- Admin dashboard with mock operational stats
- Product management with permission-gated destructive actions
- Order management with mock payment verification UI
- Inventory views with stock in / stock out history
- Roles and permissions preview UI
- Reports, promotions, reviews, users, settings, and email templates pages

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase SDK and Cloudinary integrations

## Public Website Pages

- `/`
- `/shop`
- `/product/[id]`
- `/cart`
- `/checkout`
- `/login`
- `/register`
- `/account`
- `/account/orders`
- `/account/track-order`
- `/about`
- `/contact`
- `/faq`
- `/size-guide`
- `/return-policy`
- `/privacy-policy`
- `/terms`

## Admin Panel Pages

- `/admin`
- `/admin/login`
- `/admin/dashboard`
- `/admin/products`
- `/admin/products/add`
- `/admin/products/edit/[id]`
- `/admin/categories`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/inventory`
- `/admin/inventory/[productId]`
- `/admin/customers`
- `/admin/reports`
- `/admin/promotions`
- `/admin/reviews`
- `/admin/users`
- `/admin/roles`
- `/admin/settings`
- `/admin/email-templates`

## Customer Account Features

- Account overview dashboard
- Mock login and registration flow
- Order history
- Individual order detail pages
- Track order page inside the account area
- Payment history and payment methods pages
- Delivery addresses, returns, exchanges, and notifications placeholders

## Payment Methods

- Cash on Delivery
- Bank Transfer
- Bank Deposit with receipt upload
- Online Card Payment mock preview for future gateway integration

## Inventory Management

- Product stock overview
- Low-stock visibility
- Variant-level stock visibility
- Stock in and stock out movement history

## Role-Based Permissions

- Admin routes are protected by a mock admin session
- `/admin` redirects to `/admin/login` or `/admin/dashboard` depending on mock auth state
- Admin navigation changes based on the selected mock role
- Sensitive actions like product deletion stay hidden unless the role has permission

## Future Integrations

- Cloudinary
- Resend Email API
- PayHere / Stripe

## How To Run

```bash
npm install
npm run dev
npm run build
```

## Demo Notes

- All data is currently mock data for safe frontend-only demos
- Supabase is used for application data and authentication
- No real payment gateway is connected
- The project is prepared for responsive demo use on mobile and desktop
