# Changelog

## [3.3.0] - 2024-05-13

### Added
- **Heleket Payment Integration** — Replaced WorldFirst with Heleket for crypto & fiat payments
- **Advanced User Dashboard** (`dashboard.html`) — Full-featured user area with:
  - Overview stats with animated counters
  - Transaction history with status filters (All/Completed/Pending/Failed)
  - Visual downloads grid with product previews
  - Profile & security settings panel
  - Activity timeline
  - Responsive sidebar with mobile hamburger menu
  - Glassmorphism design with gradient background orbs
- **Heleket Domain Verification** — Meta tag `<meta name="heleket" content="3bebdecb" />` on all pages
- **Payment Gateway Selection** — Users can choose Paystack or Heleket at checkout
- **Order History Persistence** — Completed orders saved to localStorage for dashboard display
- **Sitemap.xml** — SEO-friendly sitemap for search engines
- **Robots.txt** — Crawler directives (admin pages disallowed)
- **Netlify.toml** — Build configuration with security headers
- **.env.example** — Template for all required environment variables
- **LICENSE** — MIT License
- **CHANGELOG.md** — Version history

### Changed
- **Login redirect** — Non-admin users now go to `dashboard.html` instead of `index.html`
- **Admin settings** — Gateway options now show Paystack vs Heleket
- **Download page** — Added quick links to Dashboard and Store
- **Payment callback** — Auto-saves order to localStorage history on success
- **Storefront** — New "Payment Methods" section showcasing both gateways
- **README** — Complete rewrite with Heleket setup instructions

### Removed
- **WorldFirst** — All WorldFirst integration code and references removed

### Security
- Added security headers via `netlify.toml` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Admin API endpoints protected with JWT verification
- Download tokens expire after 30 days

## [3.2.0] - 2024-05-01

### Added
- Firebase Firestore database layer
- Gmail SMTP email notifications (welcome, receipt, admin alert)
- Google OAuth 2.0 authentication
- Paystack payment integration
- WorldFirst payment integration (now replaced)
- Netlify Functions serverless backend
- Admin panel with product/orders/customers management

### Stack
- HTML + CSS + Vanilla JS frontend
- Netlify hosting & serverless functions
- Firebase Firestore (Spark plan)
- Gmail SMTP (free email)
- Paystack + WorldFirst payments
