# TradeSphere Backend — Deployment Guide

## Pre-flight Checklist

### 1. Environment Variables (copy `.env.example` → `.env`)

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `ACCESS_TOKEN_SECRET` | ✅ | Min 64 chars — `openssl rand -hex 64` |
| `REFRESH_TOKEN_SECRET` | ✅ | Min 64 chars — `openssl rand -hex 64` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | ✅ | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | From Cloudinary dashboard |
| `NODE_ENV` | ✅ | Set to `production` |
| `CORS_ORIGIN` | ✅ | Your frontend domain, e.g. `https://tradesphere.in` |
| `FRONTEND_URL` | ✅ | Same as above — used in password reset emails |
| `PORT` | ✅ | Usually `8000` or set by host |
| `SMTP_HOST` | ✅ | e.g. `smtp.sendgrid.net` |
| `SMTP_PORT` | ✅ | `587` |
| `SMTP_USER` | ✅ | `apikey` (for SendGrid) |
| `SMTP_PASS` | ✅ | Your SendGrid/Mailgun API key |
| `EMAIL_FROM` | ✅ | `TradeSphere <noreply@yourdomain.com>` |
| `OLA_MAPS_API_KEY` | ⚠️ | Optional — address autocomplete |
| `REFERRAL_BONUS_REFERRER` | ⚠️ | Default: 100 |
| `REFERRAL_BONUS_REFEREE` | ⚠️ | Default: 50 |

### 2. MongoDB Atlas Setup
- Whitelist your server IP (or `0.0.0.0/0` for Railway/Render)
- Create a DB user with `readWrite` permissions only
- Enable Atlas backups

### 3. Deploy Commands
```bash
# Install dependencies (no devDependencies in prod)
npm install --omit=dev

# Start server
npm start
```

### 4. Health Check
```
GET /health  →  { status: "ok", environment: "production", timestamp: "..." }
```
Configure your host to ping `/health` every 30s.

### 5. Process Manager (if using a VPS)
```bash
npm install -g pm2
pm2 start src/index.js --name tradesphere-api --interpreter node
pm2 save
pm2 startup
```

### 6. Frontend `.env` for Production
```
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_OLA_MAPS_API_KEY=your_ola_maps_key
```

### 7. Frontend Build
```bash
npm run build
# Upload /dist to your CDN / static host (Vercel, Netlify, etc.)
```

## Security Notes
- Never commit `.env` — it's in `.gitignore`
- JWT secrets must be different from each other
- `NODE_ENV=production` enables: HTTPS-only cookies, strict CSP, rate limiting on all routes
- CORS blocks all origins except `CORS_ORIGIN` in production
