# TradeSphere Backend

Node.js + Express + MongoDB REST API for the TradeSphere B2B/B2C marketplace.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, and Cloudinary credentials
```

### 3. Seed the database (first time only)
```bash
npm run seed
```
This creates the first admin account. **Change the password after first login.**

### 4. Start the server
```bash
npm run dev     # development (hot reload)
npm start       # production
```

---

## API Endpoints

| Base Path | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login |
| `POST /api/auth/logout` | Logout |
| `GET  /api/marketplace/products` | Browse all products |
| `GET  /api/marketplace/categories/tree` | Category tree |
| `GET  /api/marketplace/search/products` | Search products |
| `POST /api/orders/place` | Place order |
| `GET  /api/orders/my-orders` | My orders |
| `GET  /api/vendor/products` | Vendor's products |
| `POST /api/vendor/products` | Add product |
| `GET  /api/admin/dashboard` | Admin dashboard |
| `GET  /api/wallet` | My wallet balance |
| `GET  /api/ratings/product/:id` | Product ratings |
| `GET  /health` | Health check |

---

## Security Features
- **Helmet.js** — 15+ security headers
- **Rate limiting** — 20 auth requests / 500 API requests per 15 min per IP
- **JWT** — Access (15m) + Refresh (7d) tokens
- **httpOnly cookies** — XSS protection
- **bcrypt** — Password hashing (10 rounds)

---

## Deployment Checklist
- [ ] Set `NODE_ENV=production` in environment
- [ ] Use strong random strings for JWT secrets (min 64 chars)
- [ ] Set `CORS_ORIGIN` to your actual frontend domain
- [ ] Run `npm run seed` once to create admin
- [ ] Ensure MongoDB connection string is correct
- [ ] Set up Cloudinary for image uploads
