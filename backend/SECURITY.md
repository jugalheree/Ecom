# 🔐 Security Action Checklist

This file documents all security fixes applied to the TradeSphere codebase
and the **manual steps you must complete before deploying to production**.

---

## ⚠️  IMMEDIATE ACTION REQUIRED — Rotate These Credentials

The following real secrets were found committed in `.env` and must be rotated
**before this code is pushed to any repository or deployed**:

| Secret | Action |
|--------|--------|
| MongoDB Atlas password | Go to Atlas → Database Access → Edit user → Reset password |
| Cloudinary API Key & Secret | Go to Cloudinary → Settings → Access Keys → Generate new key |
| Ola Maps API Key | Go to Ola Maps developer console → Regenerate key |
| JWT secrets (were weak English phrases) | Already fixed — see instructions below |

---

## 🔑 How to Generate Strong JWT Secrets

Run this in your terminal and paste the output into `.env`:

```bash
# Generate ACCESS_TOKEN_SECRET
openssl rand -hex 64

# Generate REFRESH_TOKEN_SECRET
openssl rand -hex 64
```

The result should look like:
```
a3f8c2e1d94b0f76...  (128 hex characters)
```

---

## 📋 Pre-Deployment Checklist

### Backend
- [ ] All credentials in `.env` rotated (see table above)
- [ ] `.env` is in `.gitignore` (already set ✅)
- [ ] `NODE_ENV=production` set on the server
- [ ] `FRONTEND_URL` set to the real production domain
- [ ] `CORS_ORIGIN` set to the real production frontend URL
- [ ] MongoDB Atlas IP whitelist restricted to your server's IP only
- [ ] SMTP credentials configured (SendGrid/Mailgun/SES)
- [ ] Cloudinary upload preset restricted to signed uploads only

### Frontend
- [ ] `VITE_API_BASE_URL` set to the real production backend URL
- [ ] `VITE_OLA_MAPS_API_KEY` set to the real (rotated) key
- [ ] Build with `npm run build` — dev-only reset link is automatically hidden

---

## 🛡️ Security Fixes Applied (Summary)

### Critical
1. **Credentials scrubbed from `.env`** — replaced with safe placeholders
2. **JWT secrets strengthened** — instructions above
3. **JWT no longer stored in localStorage** — httpOnly cookies only
4. **Open redirect fixed in Login** — redirect param validated as relative path
5. **`markReturnPickedUp` authorization** — vendor ownership check added
6. **`VITE_API_URL` → `VITE_API_BASE_URL`** — env key mismatch fixed

### High
7. **`cancelOrder` is now transactional** — atomic stock restore + wallet refund
8. **Input sanitization middleware** — HTML tags stripped from all req.body strings
9. **All buyer-only routes restricted to BUYER role** — orders, cart
10. **Scheduled date validated before stock deduction** — prevents unnecessary rollbacks

### Medium
11. **Content Security Policy enabled in production**
12. **Rate limiter skip uses explicit `"development"` check**
13. **DB connection has timeouts + graceful shutdown**
14. **`/api/health` endpoint added**
15. **Dev reset link hidden in production** (`import.meta.env.DEV` guard)

### Housekeeping
16. **`ACCESS_TOKEN_EXPIRY` env key fixed** — tokens now correctly expire in 15m
17. **Stray `console.log(hash))` file deleted**
18. **Duplicate Cart models** — `models/user/Cart.model.js` deprecated (unused)
19. **`/api/health` route added** alongside `/health`
20. **Route guards use `user` object** instead of `token` for auth state

---

## 📁 Files Changed

### Backend
| File | Change |
|------|--------|
| `.env` | Credentials scrubbed — **you must fill in real values** |
| `src/app.js` | CSP enabled, sanitize middleware wired, rate limiter fix, /api/health |
| `src/db/index.js` | Connection timeouts + graceful shutdown |
| `src/models/auth/User.model.js` | Env key fix: `ACCESS_TOKEN_EXPIRY` |
| `src/middlewares/sanitize.middleware.js` | New — strips HTML from req.body |
| `src/controllers/order.controller.js` | cancelOrder transaction, markReturnPickedUp auth, early date validation |
| `src/routes/order.routes.js` | BUYER role restriction on all order routes |
| `src/routes/cart.routes.js` | BUYER role restriction on all cart routes |
| `src/models/user/Cart.model.js` | Deprecated (renamed `.deprecated`) |
| `src/models/user/CartItem.model.js` | Deprecated (renamed `.deprecated`) |

### Frontend
| File | Change |
|------|--------|
| `.env` | Real API key scrubbed, key name corrected |
| `src/services/api.js` | Removed localStorage token read/write, fixed baseURL key |
| `src/lib/axios.js` | Removed localStorage token, fixed baseURL key |
| `src/store/authStore.js` | Token removed from state and localStorage |
| `src/store/cartStore.js` | `isLoggedIn` checks `user` not `token` |
| `src/pages/Login.jsx` | Open redirect fix, removed token from login() call |
| `src/pages/Register.jsx` | Removed token from login() call |
| `src/pages/ForgotPassword.jsx` | Dev reset link gated behind `import.meta.env.DEV` |
| `src/routes/ProtectedRoute.jsx` | Uses `user` not `token` |
| `src/routes/AdminRoute.jsx` | Uses `user` not `token` |
| `src/routes/DeliveryRoute.jsx` | Uses `user` not `token` |
