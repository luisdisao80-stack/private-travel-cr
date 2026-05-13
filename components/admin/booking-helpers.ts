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
      return "bg-green-500/15 text-green-300 border border-green-500/40";
    case "completed":
      return "bg-blue-500/15 text-blue-300 border border-blue-500/40";
    case "cancelled":
      return "bg-red-500/15 text-red-300 border border-red-500/40";
    case "pending":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/40";
    default:
      return "bg-zinc-800 text-gray-400 border border-zinc-700";
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
