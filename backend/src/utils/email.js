import nodemailer from "nodemailer";

// ── Create transporter ────────────────────────────────────────────────────
// Supports SMTP (production) and Ethereal (dev auto-test accounts)
const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    // Production SMTP (SendGrid, Mailgun, SES, etc.)
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Development fallback — logs email to console instead of sending
  return nodemailer.createTransport({
    jsonTransport: true, // fake transport — outputs JSON, never sends
  });
};

const transporter = createTransporter();
const FROM = process.env.EMAIL_FROM || "TradeSphere <noreply@tradesphere.in>";

// ── Helper: send mail ─────────────────────────────────────────────────────
const sendMail = async ({ to, subject, html, text }) => {
  const info = await transporter.sendMail({ from: FROM, to, subject, html, text });

  // In dev (jsonTransport), log the email so devs can see the reset link
  if (!process.env.SMTP_HOST && process.env.NODE_ENV !== "production") {
    const parsed = typeof info.message === "string" ? JSON.parse(info.message) : info;
    console.log("\n📧 [DEV EMAIL — not sent]");
    console.log("  To     :", to);
    console.log("  Subject:", subject);
    // Strip HTML tags for readable console output
    console.log("  Body   :", text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    console.log("");
  }

  return info;
};

// ── Password Reset ────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const subject = "Reset your TradeSphere password";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 40px;text-align:center">
          <div style="display:inline-flex;align-items:center;gap:10px">
            <div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:10px;display:inline-block;text-align:center;line-height:40px;font-weight:700;color:#fff;font-style:italic">T</div>
            <span style="font-size:20px;font-weight:700;color:#fff">Trade<span style="color:#818cf8">Sphere</span></span>
          </div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px 40px 32px">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827">Reset your password</h1>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6">
            Hi ${name || "there"}, we received a request to reset the password for your TradeSphere account.
            Click the button below to choose a new password.
          </p>

          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:0.3px">
              Reset Password →
            </a>
          </div>

          <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;line-height:1.6">
            This link expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
          <p style="margin:12px 0 0;color:#9ca3af;font-size:13px;word-break:break-all">
            Or paste this URL in your browser:<br>
            <a href="${resetUrl}" style="color:#6366f1">${resetUrl}</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center">
          <p style="margin:0;color:#9ca3af;font-size:12px">
            © ${new Date().getFullYear()} TradeSphere. All rights reserved.<br>
            This email was sent to ${email}
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${name || "there"},\n\nReset your TradeSphere password by visiting:\n${resetUrl}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`;

  return sendMail({ to: email, subject, html, text });
};

// ── Order Confirmation ────────────────────────────────────────────────────
export const sendOrderConfirmationEmail = async (email, name, order) => {
  const subject = `Order Confirmed — #${order.orderNumber || order._id}`;

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px">${item.title || "Product"}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;text-align:right">×${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;text-align:right">₹${((item.priceAtPurchase || 0) * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <tr><td style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:28px 40px;text-align:center">
          <span style="font-size:18px;font-weight:700;color:#fff">Trade<span style="color:#818cf8">Sphere</span></span>
        </td></tr>
        <tr><td style="padding:36px 40px">
          <h2 style="margin:0 0 4px;color:#111827;font-size:20px">Order Confirmed! 🎉</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${name || "there"}, your order has been placed successfully.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <th style="text-align:left;padding-bottom:8px;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Item</th>
              <th style="text-align:right;padding-bottom:8px;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase">Qty</th>
              <th style="text-align:right;padding-bottom:8px;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase">Amount</th>
            </tr>
            ${itemsHtml}
            <tr>
              <td colspan="2" style="padding-top:12px;font-weight:700;color:#111827;font-size:15px">Total</td>
              <td style="padding-top:12px;font-weight:700;color:#4f46e5;font-size:16px;text-align:right">₹${(order.totalAmount || 0).toLocaleString()}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center">
          <p style="margin:0;color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} TradeSphere. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${name || "there"},\n\nYour order has been confirmed!\nOrder Total: ₹${(order.totalAmount || 0).toLocaleString()}\n\nThank you for shopping on TradeSphere.`;

  return sendMail({ to: email, subject, html, text });
};
