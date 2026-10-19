import { notFound } from "next/navigation";
import { getTopLevelCategories } from "@/lib/queries/categories";
import { db } from "@/lib/db";
import EditProductForm from "@/components/admin/products/[id]/edit/edit-product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    getTopLevelCategories(),
  ]);

  if (!product) notFound();

  return (
    <EditProductForm
      product={{
        id: product.id,
        name: product.name,
        desc: product.desc ?? "",
        categoryId: product.categoryId,
        subCategoryId: product.subCategoryId ?? "",
        price: product.price,
        offerPrice: product.offerPrice ?? null,
        isAvailable: product.isAvailable,
        images: product.images as string[],
      }}
      categories={categories}
    />
  );
}
