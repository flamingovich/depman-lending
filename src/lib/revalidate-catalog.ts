import { revalidatePath } from "next/cache";

export function revalidateCatalogPages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/partners");
}
