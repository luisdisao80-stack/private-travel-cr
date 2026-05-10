// Tilopay payment gateway client.
// Docs: https://documenter.getpostman.com/view/12758640/TVKA5KUT
//
// Flow:
//   1. POST /login (apiuser, password) → bearer token (24h)
//   2. POST /processPayment (key, amount, orderNumber, redirect, billTo*) → checkout URL
//   3. Customer pays; Tilopay redirects to our `redirect` URL.
//   4. POST /consult (key, orderNumber) → transaction status (code "1" = approved).
//
// Env vars (server only):
//   TILOPAY_API_USER       - "apiuser" credential
//   TILOPAY_API_PASSWORD   - "password" credential
//   TILOPAY_API_KEY        - merchant key sent in payment requests
//   TILOPAY_API_URL        - optional, defaults to https://app.tilopay.com

const DEFAULT_BASE = "https://app.tilopay.com";

function env() {
  const apiUser = process.env.TILOPAY_API_USER;
  const apiPassword = process.env.TILOPAY_API_PASSWORD;
  const apiKey = process.env.TILOPAY_API_KEY;
  const baseUrl = process.env.TILOPAY_API_URL || DEFAULT_BASE;
  if (!apiUser || !apiPassword || !apiKey) {
    throw new Error(
      "Missing Tilopay env vars: TILOPAY_API_USER, TILOPAY_API_PASSWORD, TILOPAY_API_KEY"
    );
  }
  return { apiUser, apiPassword, apiKey, baseUrl };
}

// In-memory token cache so we don't hit /login on every request.
// Vercel may spin multiple instances; that's fine — each caches independently.
type CachedToken = { value: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

export async function getToken(): Promise<string> {
  const now = Date.now();
  // Refresh ~5 min before real expiry.
  if (cachedToken && cachedToken.expiresAt - 5 * 60 * 1000 > now) {
    return cachedToken.value;
  }
  const { apiUser, apiPassword, baseUrl } = env();
  const resp = await fetch(`${baseUrl}/api/v1/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiuser: apiUser, password: apiPassword }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Tilopay login failed (${resp.status}): ${text}`);
  }
  const data = (await resp.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number; // seconds
  };
  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

export type ProcessPaymentInput = {
  amount: number; // e.g. 150.00
  currency?: "USD" | "CRC";
  orderNumber: string;
  redirect: string; // absolute URL where Tilopay sends the customer after payment
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipPostCode?: string;
    country?: string; // ISO2, default CR
  };
  /** Arbitrary opaque data passed back in the redirect. Tilopay base64-encodes it. */
  returnData?: string;
};

export type ProcessPaymentResponse = {
  type: string; // "100" on success
  html?: string;
  url?: string; // checkout URL to redirect the customer to
  message?: string;
};

export async function processPayment(
  input: ProcessPaymentInput
): Promise<ProcessPaymentResponse> {
  const token = await getToken();
  const { apiKey, baseUrl } = env();
  const c = input.customer;
  const body = {
    redirect: input.redirect,
    key: apiKey,
    amount: input.amount.toFixed(2),
    currency: input.currency || "USD",
    orderNumber: input.orderNumber,
    capture: "1",
    billToFirstName: c.firstName,
    billToLastName: c.lastName,
    billToAddress: c.address || "Costa Rica",
    billToAddress2: "",
    billToCity: c.city || "San Jose",
    billToState: c.state || "SJ",
    billToZipPostCode: c.zipPostCode || "10101",
    billToCountry: c.country || "CR",
    billToTelephone: c.phone,
    billToEmail: c.email,
    shipToFirstName: c.firstName,
    shipToLastName: c.lastName,
    shipToAddress: c.address || "Costa Rica",
    shipToAddress2: "",
    shipToCity: c.city || "San Jose",
    shipToState: c.state || "SJ",
    shipToZipPostCode: c.zipPostCode || "10101",
    shipToCountry: c.country || "CR",
    shipToTelephone: c.phone,
    subscription: "0",
    platform: "api",
    returnData: input.returnData
      ? Buffer.from(input.returnData, "utf-8").toString("base64")
      : "",
    hashVersion: "V2",
    token_version: "v2",
  };
  const resp = await fetch(`${baseUrl}/api/v1/processPayment`, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Tilopay processPayment failed (${resp.status}): ${text}`);
  }
  return (await resp.json()) as ProcessPaymentResponse;
}

export type ConsultTransaction = {
  id_tilopay: number;
  orderNumber: string;
  amount: string;
  currency: string;
  merchantId: string;
  code: string; // "1" = approved
  response: string; // e.g. "Transacción aprobada"
  auth: string;
  card?: string;
  last?: string;
  environment: string;
  type: string;
  date: string;
};

export type ConsultResponse = {
  type: string; // "200" success
  message: string;
  response: ConsultTransaction[];
};

export async function consultTransaction(orderNumber: string): Promise<ConsultResponse> {
  const token = await getToken();
  const { apiKey, baseUrl } = env();
  const resp = await fetch(`${baseUrl}/api/v1/consult`, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key: apiKey, orderNumber, merchantId: "" }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Tilopay consult failed (${resp.status}): ${text}`);
  }
  return (await resp.json()) as ConsultResponse;
}

export function isApproved(c: ConsultTransaction | undefined): boolean {
  return !!c && c.code === "1";
}
