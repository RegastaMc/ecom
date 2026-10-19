import BannerSection from "@/components/BannerSection";
import CategoriesSection from "@/components/CategoriesSection";
import Testimonials from "@/components/components/Ui/Testimonials";
import ProductList from "@/components/ProductList";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  getDiscountedProducts,
  getNewArrivals,
  getTopSellingProducts,
} from "./actions/getSortedProducts";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "./actions/getProducts";

const SectionLoading = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-[#F5EBEO] p-4 animate-pulse"
      >
        <div className="aspect-square bg-[#F5EBEO] rounded-xl"></div>
        <div className="h-4 bg-[#F5EBEO] rounded mt-3"></div>
        <div className="h-4 bg-[#F5EBEO] rounded w-2/3 mt-2"></div>
      </div>
    ))}
  </div>
);

interface SectionProps {
  title: string;
  viewAllLink?: string;
  children: React.ReactNode;
}

const Section = ({ title, viewAllLink, children }: SectionProps) => (
  <section className="mb-12">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-[#3d2c28]">{title}</h2>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="text-[#DBA39A] hover:text-[#c49087] font-medium flex items-center gap-1 transition-colors text-sm"
        >
          View All <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
      {children}
    </div>
  </section>
);

async function TopSellingSection() {
  const products = await getTopSellingProducts(8);
  if (products.length === 0) return null;

  return (
    <Section title="Top Selling Products" viewAllLink="/products?sort=popular">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Section>
  );
}

async function NewArrivalsSection() {
  const products = await getNewArrivals(8);
  if (products.length === 0) return null;

  return (
    <Section title="New Arrivals" viewAllLink="/products?sort=newest">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Section>
  );
}

async function FeaturedSection() {
  const products = await getFeaturedProducts(6);
  if (products.products.length === 0) return null;

  return (
    <Section title=" Featured Products" viewAllLink="/products?filter=featured">
      {products.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Section>
  );
}

async function DiscountedSection() {
  const products = await getDiscountedProducts(6);
  if (products.length === 0) return null;

  return (
    <Section title="Products On Offer" viewAllLink="/products?filter=sale">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Section>
  );
}

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;

  return (
    <div className=" px-4">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-sm">
        <BannerSection />
      </div>

      {/* <CategoriesSection /> */}
      {/* <div className='flex flex-1 justify-center items-center min-h-80'>deployment in progress...</div> */}

      <Suspense fallback={<SectionLoading />}>
        <TopSellingSection />
      </Suspense>

      {/* New Arrivals */}
      <Suspense fallback={<SectionLoading />}>
        <NewArrivalsSection />
      </Suspense>

      {/* Featured Products */}
      <Suspense fallback={<SectionLoading />}>
        <FeaturedSection />
      </Suspense>

      {/* Discounted Products */}
      <Suspense fallback={<SectionLoading />}>
        <DiscountedSection />
      </Suspense>

      {/* Category Sections
      {categories.map((category) => (
        <Suspense key={category.id} fallback={<SectionLoading />}>
          <CategorySection category={category} />
        </Suspense>
      ))} */}
    </div>
  );
};

export default Homepage;
