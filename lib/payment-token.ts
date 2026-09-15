// lib/payment-token.ts
import { randomBytes } from "node:crypto";

// Genera el token URL-safe que identifica una reserva en /pay/[token].
// 24 caracteres base64url = ~144 bits: adivinar un token válido es
// imposible en la práctica (muchísimo más espacio que reservas vivas).
//
// Vivía como función local en app/admin/(authed)/actions.ts (cotizaciones
// del admin). Ahora el cron de recuperación de pagos abandonados también
// genera tokens, y actions.ts es "use server" — solo puede exportar
// funciones async — así que la única forma de compartirla es sacarla a
// lib. Una sola implementación para que los dos flujos nunca difieran.
export function generatePaymentToken(): string {
  return randomBytes(18)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
