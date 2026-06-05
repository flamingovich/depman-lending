"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePartnerButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Удалить проект «${name}»?`)) return;
    setLoading(true);
    await fetch(`/api/partners/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 disabled:opacity-60"
    >
      {loading ? "..." : "Удалить"}
    </button>
  );
}
