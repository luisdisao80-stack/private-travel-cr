import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ChevronLeft } from "lucide-react";
import { isAdminAuthed } from "@/lib/admin-auth";
import { logoutAction } from "./actions";

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
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/70 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-amber-400 inline-flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Site
            </Link>
            <span className="text-zinc-700">·</span>
            <Link
              href="/admin"
              className="text-sm font-bold text-amber-400 hover:text-amber-300"
            >
              Admin
            </Link>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-900"
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
