import { Lock } from "lucide-react";
import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin-auth";
import { loginAction } from "./actions";

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
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-amber-500/25 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 mb-3">
              <Lock size={20} className="text-amber-400" />
            </div>
            <h1 className="text-xl font-bold">Admin sign in</h1>
            <p className="text-xs text-gray-500 mt-1">
              Private Travel CR · operator area
            </p>
          </div>

          <form action={loginAction} className="space-y-4">
            <label className="block">
              <span className="text-xs text-gray-400 uppercase tracking-wider">
                Password
              </span>
              <input
                type="password"
                name="password"
                required
                autoFocus
                autoComplete="current-password"
                className="mt-1.5 w-full bg-black/60 border border-zinc-800 focus:border-amber-500/60 focus:outline-none rounded-lg px-3 py-2.5 text-sm"
              />
            </label>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                Wrong password.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-2.5 rounded-lg transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
