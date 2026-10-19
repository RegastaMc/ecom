import NewProductForm from "@/components/admin/products/new/new-product-form";
import { getTopLevelCategories } from "@/lib/queries/categories";

export default async function NewProductPage() {
  const categories = await getTopLevelCategories();
  return <NewProductForm categories={categories} />;
}
