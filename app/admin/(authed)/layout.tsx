import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ChevronLeft } from "lucide-react";
import { isAdminAuthed } from "@/lib/admin-auth";
import { logoutAction } from "./actions";
import { ADMIN_PALETTE } from "@/lib/admin-theme";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Private Travel CR",
  robots: { index: false, follow: false },
};

export default async function AuthedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-theme min-h-screen bg-adm-bg text-adm-text" data-admin-palette={ADMIN_PALETTE}>
      <header className="sticky top-0 z-30 backdrop-blur-md bg-adm-bg/70 border-b border-adm-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-adm-faint hover:text-adm-accent-hover inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Site
            </Link>
            <span className="text-adm-border-strong">·</span>
            <Link
              href="/admin"
              className="text-sm font-bold text-adm-accent hover:text-adm-accent-hover"
            >
              Admin
            </Link>
            <span className="text-adm-border-strong">·</span>
            <Link
              href="/admin/analytics"
              className="text-sm font-medium text-adm-text-2 hover:text-adm-accent-hover inline-flex items-center gap-1"
            >
              <span aria-hidden>📊</span> Analytics
            </Link>
            <span className="text-adm-border-strong">·</span>
            <Link
              href="/admin/wetravel"
              className="text-sm font-medium text-adm-text-2 hover:text-adm-accent-hover inline-flex items-center gap-1"
            >
              <span aria-hidden>🧾</span> WeTravel
            </Link>
            <span className="text-adm-border-strong">·</span>
            <Link
              href="/admin/despacho"
              className="text-sm font-medium text-adm-text-2 hover:text-adm-accent-hover inline-flex items-center gap-1"
            >
              <span aria-hidden>🚐</span> Despacho
            </Link>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs text-adm-muted hover:text-adm-text inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-adm-surface-2"
            >
              <LogOut size={12} />
              Log out
            </button>
          </form>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
