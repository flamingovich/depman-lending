import { ContestStylePreview } from "@/components/miniapp/ContestStylePreview";
import { MiniAppShell } from "@/components/miniapp/MiniAppShell";
import "./preview.css";

export default function ContestPreviewPage() {
  return (
    <MiniAppShell>
      <main className="app-main-below-header tma-gutter-x pt-4">
        <ContestStylePreview />
      </main>
    </MiniAppShell>
  );
}
