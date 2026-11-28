import { Lock } from "lucide-react";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { loginAction } from "./actions";
import { ADMIN_PALETTE } from "@/lib/admin-theme";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Sign in",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ error?: string }>;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (await isAdminAuthed()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="admin-theme min-h-screen bg-adm-bg text-adm-text flex items-center justify-center px-4" data-admin-palette={ADMIN_PALETTE}>
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-br from-adm-surface to-adm-bg border border-adm-accent/25 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-adm-accent/10 border border-adm-accent/30 mb-3">
              <Lock size={20} className="text-adm-accent" />
            </div>
            <h1 className="text-xl font-bold">Admin sign in</h1>
            <p className="text-xs text-adm-faint mt-1">
              Private Travel CR · operator area
            </p>
          </div>

          <form action={loginAction} className="space-y-4">
            <label className="block">
              <span className="text-xs text-adm-muted uppercase tracking-wider">
                Password
              </span>
              <input
                type="password"
                name="password"
                required
                autoFocus
                autoComplete="current-password"
                className="mt-1.5 w-full bg-adm-bg/60 border border-adm-border-strong focus:border-adm-accent/60 focus:outline-none rounded-lg px-3 py-2.5 text-sm"
              />
            </label>

            {error && (
              <p className="text-xs text-adm-danger bg-adm-danger/10 border border-adm-danger/30 rounded-md px-3 py-2">
                Wrong password.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-adm-accent hover:bg-adm-accent-hover text-adm-on-accent font-bold text-sm py-2.5 rounded-lg transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
