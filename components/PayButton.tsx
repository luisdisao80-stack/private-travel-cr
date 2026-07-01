"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

// Client-side "Pay now" button for the /pay/[token] page. POSTs the
// token to /api/payment/start-from-token, receives a Tilopay checkout
// URL, then redirects the browser there. If anything goes wrong the
// button surfaces a friendly error inline instead of throwing.

type Props = {
  token: string;
  totalUsd: number;
};

export default function PayButton({ token, totalUsd }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/start-from-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        let msg = "Something went wrong. Please try again or WhatsApp Diego.";
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        // Friendlier phrasing for the common branches.
        if (res.status === 404) msg = "This payment link isn't valid.";
        else if (res.status === 409) msg = "This booking is already paid.";
        else if (res.status === 410)
          msg = "This link has expired. Ask Diego to resend it.";
        throw new Error(msg);
      }
      const data = (await res.json()) as {
        checkoutUrl?: string;
      };
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      throw new Error("Payment provider didn't return a URL.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full h-14 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-base rounded-xl transition-colors inline-flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <CreditCard size={18} />
            Pay ${totalUsd.toFixed(2)} USD &amp; confirm booking
          </>
        )}
      </button>
      {error && (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
    </>
  );
}
