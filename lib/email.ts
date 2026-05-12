// Transactional email via Resend. Server-only.
//
// Env vars:
//   RESEND_API_KEY   - required.
//   EMAIL_FROM       - optional, defaults to Resend's sandbox sender.
//                      Switch to "Private Travel CR <bookings@privatetravelcr.com>"
//                      once the domain is verified in Resend.
//   BUSINESS_EMAIL   - optional, defaults to info@privatetravelcr.com.
//
// Failures are logged and swallowed so a flaky email API never blocks the
// booking redirect after a successful payment.

import { Resend } from "resend";
import type { CartItem } from "@/lib/CartContext";

const DEFAULT_FROM = "Private Travel CR <onboarding@resend.dev>";
const DEFAULT_BUSINESS = "info@privatetravelcr.com";

let cached: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

export type BookingEmailInput = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalUsd: number;
  authCode?: string | null;
  cardLast4?: string | null;
  items: CartItem[];
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function format12h(time: string): string {
  if (!time || !time.includes(":")) return time || "—";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return time;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr} ${period}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tripRowsHtml(items: CartItem[]): string {
  return items
    .map((it, idx) => {
      const service = it.serviceType === "vip" ? "VIP" : "Standard";
      const pickup =
        it.pickupPlace && it.pickupPlace !== it.fromName
          ? ` <span style="color:#9ca3af">· ${escapeHtml(it.pickupPlace)}</span>`
          : "";
      const dropoff =
        it.dropoffPlace && it.dropoffPlace !== it.toName
          ? ` <span style="color:#9ca3af">· ${escapeHtml(it.dropoffPlace)}</span>`
          : "";
      return `
        <tr>
          <td style="padding:14px 16px;border-top:1px solid #1f2937;vertical-align:top;">
            <div style="font-size:12px;color:#fbbf24;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:6px;">
              Trip #${idx + 1} · ${escapeHtml(service)} · ${escapeHtml(it.vehicleName)}
            </div>
            <div style="font-size:14px;color:#ffffff;font-weight:600;">
              ${escapeHtml(it.fromName)}${pickup}
            </div>
            <div style="font-size:12px;color:#9ca3af;margin:2px 0 2px 0;">↓</div>
            <div style="font-size:14px;color:#ffffff;font-weight:600;">
              ${escapeHtml(it.toName)}${dropoff}
            </div>
            <div style="font-size:12px;color:#9ca3af;margin-top:8px;">
              ${formatDate(it.date)} · ${format12h(it.pickupTime)} · ${it.passengers} pax
              ${it.flightNumber ? ` · Flight ${escapeHtml(it.flightNumber)}` : ""}
            </div>
          </td>
          <td style="padding:14px 16px;border-top:1px solid #1f2937;text-align:right;vertical-align:top;white-space:nowrap;">
            <div style="font-size:16px;color:#ffffff;font-weight:700;">$${it.totalPrice.toFixed(2)}</div>
            <div style="font-size:11px;color:#9ca3af;">USD</div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function shellHtml({
  title,
  intro,
  data,
  showCustomer,
}: {
  title: string;
  intro: string;
  data: BookingEmailInput;
  showCustomer: boolean;
}): string {
  const customerBlock = showCustomer
    ? `
      <tr>
        <td style="padding:16px;border-top:1px solid #1f2937;">
          <div style="font-size:12px;color:#fbbf24;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">Customer</div>
          <div style="font-size:14px;color:#ffffff;">${escapeHtml(data.customerName)}</div>
          <div style="font-size:13px;color:#d1d5db;">${escapeHtml(data.customerEmail)}</div>
          ${data.customerPhone ? `<div style="font-size:13px;color:#d1d5db;">${escapeHtml(data.customerPhone)}</div>` : ""}
        </td>
      </tr>
    `
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:linear-gradient(180deg,#0a0a0a,#000);border:1px solid rgba(245,158,11,0.25);border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:28px 24px 20px 24px;text-align:center;border-bottom:1px solid #1f2937;">
              <div style="font-size:11px;color:#fbbf24;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Private Travel CR</div>
              <h1 style="margin:8px 0 0 0;font-size:24px;color:#ffffff;font-weight:800;">${escapeHtml(title)}</h1>
              <p style="margin:8px 0 0 0;font-size:14px;color:#d1d5db;">${escapeHtml(intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.02);border:1px solid rgba(245,158,11,0.15);border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:#9ca3af;">Order number</td>
                        <td style="font-size:13px;color:#fbbf24;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;">${escapeHtml(data.orderNumber)}</td>
                      </tr>
                      <tr>
                        <td style="font-size:12px;color:#9ca3af;padding-top:6px;">Total</td>
                        <td style="font-size:18px;color:#ffffff;font-weight:700;text-align:right;padding-top:6px;">$${data.totalUsd.toFixed(2)} USD</td>
                      </tr>
                      ${
                        data.authCode
                          ? `<tr><td style="font-size:12px;color:#9ca3af;padding-top:6px;">Auth code</td><td style="font-size:12px;color:#d1d5db;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;padding-top:6px;">${escapeHtml(data.authCode)}</td></tr>`
                          : ""
                      }
                      ${
                        data.cardLast4
                          ? `<tr><td style="font-size:12px;color:#9ca3af;padding-top:6px;">Card</td><td style="font-size:12px;color:#d1d5db;font-family:'SFMono-Regular',Menlo,monospace;text-align:right;padding-top:6px;">•••• ${escapeHtml(data.cardLast4)}</td></tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
                ${tripRowsHtml(data.items)}
                ${customerBlock}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 28px 24px;text-align:center;">
              <p style="margin:0 0 16px 0;font-size:13px;color:#9ca3af;">
                We&rsquo;ll be in touch shortly with the final pickup details.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://wa.me/50686334133" style="display:inline-block;background:#16a34a;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px;">Chat on WhatsApp</a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="mailto:info@privatetravelcr.com" style="display:inline-block;background:transparent;color:#fbbf24;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px;border:1px solid rgba(245,158,11,0.4);">Email us</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;background:rgba(255,255,255,0.02);border-top:1px solid #1f2937;text-align:center;">
              <div style="font-size:11px;color:#6b7280;">
                Private Travel Costa Rica · La Fortuna, Alajuela · +506 8633-4133
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendBookingEmails(data: BookingEmailInput): Promise<void> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping booking emails");
    return;
  }
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const businessTo = process.env.BUSINESS_EMAIL || DEFAULT_BUSINESS;

  const customerHtml = shellHtml({
    title: "Booking Confirmed",
    intro: `Thank you, ${data.customerName.split(" ")[0] || "friend"}. We've received your payment.`,
    data,
    showCustomer: false,
  });
  const internalHtml = shellHtml({
    title: "New booking received",
    intro: `Order ${data.orderNumber} just paid. Reach out to confirm pickup details.`,
    data,
    showCustomer: true,
  });

  // Fire both in parallel; one failing must not stop the other.
  const [customerRes, internalRes] = await Promise.allSettled([
    resend.emails.send({
      from,
      to: data.customerEmail,
      subject: `Booking Confirmed · ${data.orderNumber}`,
      html: customerHtml,
      replyTo: businessTo,
    }),
    resend.emails.send({
      from,
      to: businessTo,
      subject: `🚐 New booking · ${data.orderNumber} · $${data.totalUsd.toFixed(2)} USD`,
      html: internalHtml,
      replyTo: data.customerEmail,
    }),
  ]);

  if (customerRes.status === "rejected") {
    console.error("[email] customer send failed:", customerRes.reason);
  } else if (customerRes.value.error) {
    console.error("[email] customer send error:", customerRes.value.error);
  }
  if (internalRes.status === "rejected") {
    console.error("[email] internal send failed:", internalRes.reason);
  } else if (internalRes.value.error) {
    console.error("[email] internal send error:", internalRes.value.error);
  }
}
