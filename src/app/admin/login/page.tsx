import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050e1c]">
          <p className="text-sm text-slate-400">Загрузка...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
