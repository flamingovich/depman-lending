import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTheme } from "@/components/admin/AdminTheme";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminTheme>
      <AdminShell>{children}</AdminShell>
    </AdminTheme>
  );
}
