import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import EditCategoryForm from "@/components/admin/categories/[id]/edit/edit-category-form";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, parents] = await Promise.all([
    db.category.findUnique({ where: { id } }),
    db.category.findMany({
      where: { parentId: null, id: { not: id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!category) notFound();

  return (
    <EditCategoryForm
      category={{
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        image: category.image ?? "",
        parentId: category.parentId ?? "",
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      }}
      parents={parents}
    />
  );
}
