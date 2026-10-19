import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PackageX } from "lucide-react";
import { getProductsForCategory } from "@/lib/queries/products";
import { ProductFilters } from "./ProductFilters";
import { Pagination } from "@/components/product/pagination";
import ProductCard from "@/components/ProductCard";

type SearchParams = {
  sub?: string;
  sort?: string;
  min?: string;
  max?: string;
  available?: string;
  page?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getProductsForCategory({ categorySlug: slug });

  if (!category) return { title: "Category not found" };

  return {
    title: category.category.name,
    description:
      category.category.description ||
      `Browse ${category.category.name} products`,
    openGraph:
      category.category.image ?
        { images: [category.category.image] }
      : undefined,
  };
}

export default async function ProductCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page ?? "1"));
  const sort =
    (sp.sort as "newest" | "price-asc" | "price-desc" | "name-asc") ?? "newest";
  const minPrice = sp.min ? Number(sp.min) : undefined;
  const maxPrice = sp.max ? Number(sp.max) : undefined;
  const availableOnly = sp.available === "1";

  const result = await getProductsForCategory({
    categorySlug: slug,
    subSlug: sp.sub,
    sort,
    minPrice,
    maxPrice,
    availableOnly,
    page,
  });

  if (!result) notFound();

  const { category, sub, products, total, totalPages } = result;

  return (
    <div className="min-h-screen bg-[#FEFCF3]">
      {/* HERO */}
      <section className="relative h-[260px] w-full overflow-hidden bg-[#253C6D] md:h-[320px]">
        {category.image ?
          <Image
            src={category.image}
            alt={category.name}
            fill
            priority
            className="object-cover opacity-60"
            sizes="100vw"
          />
        : <div className="absolute inset-0 bg-gradient-to-br from-[#253C6D] to-[#DBA39A]/50" />
        }
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <nav className="mb-3 flex items-center gap-2 text-xs text-white/70">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-white">
              Shop
            </Link>
            <span>/</span>
            <span className="text-white">{category.name}</span>
            {sub && (
              <>
                <span>/</span>
                <span className="text-white">{sub.name}</span>
              </>
            )}
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            {sub ? sub.name : category.name}
          </h1>
          {category.description && !sub && (
            <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">
              {category.description}
            </p>
          )}
          <p className="mt-3 text-xs text-white/70">
            {total} {total === 1 ? "product" : "products"}
          </p>
        </div>
      </section>

      {/* SUB-CATEGORY CHIPS */}
      {category.children.length > 0 && (
        <div className="border-b border-[#F5EBE0] bg-white">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 py-4">
              <Link
                href={`/product-category/${category.slug}`}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                  !sub ?
                    "border-[#DBA39A] bg-[#DBA39A] text-white"
                  : "border-[#F5EBE0] text-[#3d2c28] hover:border-[#DBA39A] hover:text-[#DBA39A]"
                }`}
              >
                All
              </Link>
              {category.children.map((child) => {
                const active = sub?.id === child.id;
                return (
                  <Link
                    key={child.id}
                    href={`/product-category/${category.slug}?sub=${child.slug}`}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active ?
                        "border-[#DBA39A] bg-[#DBA39A] text-white"
                      : "border-[#F5EBE0] text-[#3d2c28] hover:border-[#DBA39A] hover:text-[#DBA39A]"
                    }`}
                  >
                    {child.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* FILTERS */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ProductFilters
              currentSort={sort}
              currentMin={minPrice}
              currentMax={maxPrice}
              availableOnly={availableOnly}
            />
          </aside>

          {/* PRODUCTS */}
          <section>
            {products.length === 0 ?
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#F5EBE0] bg-white py-20 text-center">
                <PackageX className="mb-3 size-10 text-[#b8a69c]" />
                <h2 className="text-lg font-semibold text-[#3d2c28]">
                  No products found
                </h2>
                <p className="mt-1 max-w-sm text-sm text-[#3d2c28]/60">
                  Try adjusting your filters or explore other categories.
                </p>
                <Link
                  href={`/product-category/${category.slug}`}
                  className="mt-6 rounded-full bg-[#DBA39A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#c49087]"
                >
                  Clear filters
                </Link>
              </div>
            : <>
                <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={{
                        id: p.id,
                        slug: p.slug ?? p.id,
                        name: p.name,
                        price: p.price,
                        compareAtPrice: p.offerPrice ?? undefined,
                        image: (p.images as string[])[0] ?? "",
                      }}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      basePath={`/product-category/${category.slug}`}
                      extraParams={{
                        ...(sp.sub && { sub: sp.sub }),
                        ...(sort !== "newest" && { sort }),
                        ...(minPrice != null && { min: String(minPrice) }),
                        ...(maxPrice != null && { max: String(maxPrice) }),
                        ...(availableOnly && { available: "1" }),
                      }}
                    />
                  </div>
                )}
              </>
            }
          </section>
        </div>
      </div>
    </div>
  );
}
