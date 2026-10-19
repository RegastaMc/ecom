import NewCategoryForm from "@/components/admin/categories/new/new-category-form";
import { db } from "@/lib/db";

export default async function NewCategoryPage() {
  const parents = await db.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <NewCategoryForm parents={parents} />;
}
