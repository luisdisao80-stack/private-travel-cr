import type { CartItem } from "@/lib/CartContext";

export const STATUSES = [
  "pending",
  "approved",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof STATUSES)[number];

export function statusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case "approved":
      return "bg-adm-ok/15 text-adm-ok border border-adm-ok/40";
    case "completed":
      return "bg-adm-info/15 text-adm-info border border-adm-info/40";
    case "cancelled":
      return "bg-adm-danger/15 text-adm-danger border border-adm-danger/40";
    case "pending":
      return "bg-adm-accent/15 text-adm-accent border border-adm-accent/40";
    default:
      return "bg-adm-surface-2 text-adm-muted border border-adm-border-strong";
  }
}

// Items store pickup as local Costa Rica time strings (date "YYYY-MM-DD" +
// pickupTime "HH:MM"). Convert to a Date in UTC using CR's fixed UTC-6 offset.
export function pickupAt(item: CartItem): Date | null {
  if (!item?.date || !item?.pickupTime) return null;
  const [y, m, d] = item.date.split("-").map((s) => parseInt(s, 10));
  const [h, mi] = item.pickupTime.split(":").map((s) => parseInt(s, 10));
  if ([y, m, d, h, mi].some((n) => Number.isNaN(n))) return null;
  return new Date(Date.UTC(y, m - 1, d, h + 6, mi, 0));
}

export function earliestPickupAt(items: CartItem[] | null | undefined): Date | null {
  if (!items || items.length === 0) return null;
  const ts = items
    .map(pickupAt)
    .filter((d): d is Date => d != null)
    .map((d) => d.getTime());
  if (ts.length === 0) return null;
  return new Date(Math.min(...ts));
}

export function formatCRDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    timeZone: "America/Costa_Rica",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
