import Navbar from "./Navbar";
import { getTopLevelCategories } from "@/lib/queries/categories";

export async function NavbarServer() {
  const categories = await getTopLevelCategories();
  return <Navbar categories={categories} />;
}
