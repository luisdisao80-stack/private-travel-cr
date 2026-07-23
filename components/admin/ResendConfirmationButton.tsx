"use client";

import { useState, useTransition } from "react";
import { Send, Check, Loader2, AlertCircle } from "lucide-react";

// Client-side wrapper around the resend server action so Diego gets
// real visible feedback (loading → success → cooldown). Was previously
// a plain <form action={...}> button which fired instantly without any
// UI change — Diego thought clicks weren't registering, so he'd click
// 5–6 times, and each click sent a duplicate email to the customer
// (see Kaitlyn PTCR-1647, Jul 23 — 6 identical confirmations queued
// in Resend within 43 seconds).

type Props = {
  orderNumber: string;
  customerEmail: string | null;
  action: (formData: FormData) => Promise<unknown>;
};

type Status =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "success"; sentAt: Date }
  | { kind: "error"; message: string };

// Cooldown period after a successful send during which the button
// stays disabled. Prevents Diego reflexively clicking again "just in
// case" and firing a second copy.
const COOLDOWN_MS = 30_000;

export default function ResendConfirmationButton({
  orderNumber,
  customerEmail,
  action,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const now = Date.now();
  const inCooldown =
    status.kind === "success" && now - status.sentAt.getTime() < COOLDOWN_MS;

  const disabled = !customerEmail || isPending || inCooldown;

  function handleClick() {
    if (disabled) return;

    // Confirm before sending — Diego asked for a manual gate so he
    // doesn't send a stale confirmation by accident when he really
    // meant to click something else nearby.
    const ok = window.confirm(
      `Resend the booking confirmation email to ${customerEmail}?\n\nThis sends the original "Booking Confirmed" template (customer only — you won't get a copy).`,
    );
    if (!ok) return;

    setStatus({ kind: "pending" });
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("orderNumber", orderNumber);
        await action(fd);
        setStatus({ kind: "success", sentAt: new Date() });
      } catch (err) {
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "Send failed",
        });
      }
    });
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-bold text-xs px-4 py-2 rounded-md transition-colors min-w-[220px] justify-center"
      >
        {isPending ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            Sending…
          </>
        ) : inCooldown ? (
          <>
            <Check size={12} />
            Sent — cooldown ({secondsRemaining(status, now)}s)
          </>
        ) : (
          <>
            <Send size={12} />
            Resend confirmation to customer
          </>
        )}
      </button>

      {status.kind === "success" && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400">
          <Check size={14} />
          Sent at {formatTime(status.sentAt)}
        </span>
      )}

      {status.kind === "error" && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
          <AlertCircle size={14} />
          {status.message}
        </span>
      )}
    </div>
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function secondsRemaining(status: Status, now: number): number {
  if (status.kind !== "success") return 0;
  const elapsed = now - status.sentAt.getTime();
  return Math.max(0, Math.ceil((COOLDOWN_MS - elapsed) / 1000));
}
