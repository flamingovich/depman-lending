import { revalidatePath } from "next/cache";

export function revalidateCatalogPages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/partners");
  revalidatePath("/admin/viewer-wins");
}

export function revalidateViewerWinsPages() {
  revalidatePath("/");
  revalidatePath("/admin/viewer-wins");
}
