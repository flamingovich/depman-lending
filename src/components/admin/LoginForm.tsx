"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@depman.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Ошибка входа");
      return;
    }

    const from = searchParams.get("from") || "/admin";
    router.push(from);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050e1c] p-4">
      <form
        onSubmit={handleSubmit}
        className="admin-card w-full max-w-md p-8 shadow-2xl shadow-black/40"
      >
        <h1 className="text-2xl font-extrabold tracking-tight">DepMan Admin</h1>
        <p className="mt-1 text-sm text-slate-400">
          Вход в панель управления партнёрами
        </p>

        <div className="mt-6 space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-semibold">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold">Пароль</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
            />
          </label>
        </div>

        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
