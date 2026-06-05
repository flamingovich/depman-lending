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
    if (
      !confirm(
        `Удалить «${name}» навсегда?\n\nПроект сразу пропадёт с сайта. Отменить это действие нельзя.`,
      )
    ) {
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/partners/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      alert("Не удалось удалить проект. Попробуйте ещё раз.");
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 disabled:opacity-60"
    >
      {loading ? "..." : "Удалить"}
    </button>
  );
}
