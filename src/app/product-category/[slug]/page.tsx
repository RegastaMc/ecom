// app/product-category/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CategoryPageClient } from '@/components/CategoryPageClient';
import { getProductsByCategory } from '@/app/actions/getProducts';

// ============================================================
// TYPES
// ============================================================
interface SubCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  productCount?: number;
  subCategories?: SubCategory[];
}

// ============================================================
// CATEGORIES DATA
// ============================================================
const categories: Category[] = [
  {
    id: '1',
    name: 'Women',
    slug: 'women',
    image: 'https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782932804/women_tqw9yy.webp',
    description: 'Women toys and accessories',
    productCount: 10,
    subCategories: [
      { id: '1a', name: 'Kegel Balls', slug: 'kegel-balls' },
      { id: '1b', name: 'Sexy Underwear & Lingerie', slug: 'sexy-underwear-and-lingerie' },
      { id: '1c', name: 'Vibrators', slug: 'vibrators' },
      { id: '1d', name: 'Women Accessories', slug: 'women-accessories' },
      { id: '1e', name: 'Anal Toys For Women', slug: 'anal-toys-for-women' },
      { id: '1f', name: 'Dildos', slug: 'dildos' },
      { id: '1g', name: 'Intimate Care', slug: 'intimate-care' },
    ],
  },
  {
    id: '2',
    name: 'Men',
    slug: 'men',
    image: 'https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782955950/dildos_eezbvp.webp',
    description: 'Modern & classic',
    productCount: 98,
    subCategories: [
      { id: '2a', name: 'Male Condoms', slug: 'male-condoms' },
      { id: '2b', name: 'Male Masturbators', slug: 'male-masturbators' },
      { id: '2c', name: 'Men Accessories', slug: 'men-accessories' },
      { id: '2d', name: 'Sexy Underwear For Men', slug: 'sexy-underwear-for-men' },
      { id: '2e', name: 'Anal Toys For Men', slug: 'anal-toys-for-men' },
      { id: '2f', name: 'Cock Rings', slug: 'cock-rings' },
      { id: '2g', name: 'Larger Penis', slug: 'larger-penis' },
    ],
  },
  {
    id: '3',
    name: 'Combos',
    slug: 'combos',
    image: 'https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782956562/combos1_sz0ems.webp',
    description: 'Fun & colorful',
    productCount: 5,
    subCategories: [],
  },
  {
    id: '4',
    name: 'Couples',
    slug: 'couples',
    image: 'https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782955950/couples_wxc9jx.webp',
    description: 'Complete your look',
    productCount: 134,
    subCategories: [
      { id: '4a', name: 'Couples Sex Toys', slug: 'couples-sex-toys' },
      { id: '4b', name: 'Foreplay', slug: 'foreplay' },
      { id: '4c', name: 'Light Bondage', slug: 'light-bondage' },
      { id: '4d', name: 'Strap Ons', slug: 'strap-ons' },
      { id: '4e', name: 'Accessories And Games', slug: 'accessories-and-games' },
    ],
  },
  {
    id: '5',
    name: 'BDSM',
    slug: 'bdsm',
    image: 'https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782955950/BDSM_tipb4p.webp',
    description: 'Step in style',
    productCount: 89,
    subCategories: [
      { id: '5a', name: 'Fetish Wear', slug: 'fetish-wear' },
      { id: '5b', name: 'Kinky Sex Toys', slug: 'kinky-sex-toys' },
      { id: '5c', name: 'Sex Machines', slug: 'sex-machines' },
      { id: '5d', name: 'Sex Whips And Paddles', slug: 'sex-whips-and-paddles' },
      { id: '5e', name: 'BDSM Accessories', slug: 'bdsm-accessories' },
      { id: '5f', name: 'Bondage Restraints', slug: 'bondage-restraints' },
      { id: '5g', name: 'Chastity Devices And Cages', slug: 'chastity-devices-and-cages' },
      { id: '5h', name: 'Clamps,Pumps And Suction Cups', slug: 'clamps-pumps-and-suction-cups' },
      { id: '5i', name: 'Electro And Medical Toys', slug: 'electro-and-medical-toys' },
    ],
  },
  {
    id: '6',
    name: 'Sexy Underwear & Lingerie',
    slug: 'sexy-underwear-and-lingerie',
    image: 'https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782955951/Sexy-Underwear_hu5loc.webp',
    description: 'Glow & shine',
    productCount: 112,
    subCategories: [
      { id: '6a', name: 'Sexy Costumes', slug: 'sexy-costumes' },
      { id: '6b', name: 'Stockings And Hosiery', slug: 'stockings-and-hosiery' },
      { id: '6c', name: 'Suspender Belts', slug: 'suspender-belts' },
      { id: '6d', name: 'Thongs,Strings and Knickers', slug: 'thongs-strings-and-knickers' },
      { id: '6e', name: 'Basques And Corsets', slug: 'basques-and-corsets' },
      { id: '6f', name: 'Body Stockings', slug: 'body-stockings' },
      { id: '6g', name: 'Christmas Lingerie', slug: 'christmas-lingerie' },
      { id: '6h', name: 'Chrotchless Lingerie', slug: 'chrotchless-lingerie' },
      { id: '6i', name: 'Nightdresses', slug: 'nightdresses' },
    ],
  },
  {
    id: '7',
    name: 'Flowers',
    slug: 'flowers',
    image: 'https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782956466/flowers_klqrqu.webp',
    description: 'Cozy & modern',
    productCount: 78,
    subCategories: [],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================
async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const category = categories.find(c => c.slug === slug);
  if (!category) return null;
  return {
    ...category,
    image: category.image ?? '',
  } as Category;
}

// ============================================================
// METADATA GENERATION
// ============================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} | Wink & Wonder`,
    description: category.description || `Browse our ${category.name} collection`,
    openGraph: {
      title: `${category.name} | Wink & Wonder`,
      description: category.description || `Browse our ${category.name} collection`,
      images: category.image ? [{ url: category.image }] : [],
    },
  };
}

// ============================================================
// MAIN CATEGORY PAGE
// ============================================================
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    sort?: string;
    page?: string;
    view?: 'grid' | 'list';
  }>;
}) {
  // Await params and searchParams
  const { slug } = await params;
  const search = await searchParams;

  // Fetch category data
  const category = await getCategoryBySlug(slug);
  
  if (!category) {
    notFound();
  }

  // Get sort and pagination params
  const sort = search?.sort || 'relevance';
  const page = parseInt(search?.page || '1');
  const view = search?.view || 'grid';
  const limit = 20;

  // Fetch real products for this category using server action
  const result = await getProductsByCategory(category.name);
  
  // Handle the response properly
  let products: any[] = [];
  let total = 0;
  
  if (result.success) {
    products = result.products || [];
    total = products.length;
  }

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  // Get current page items
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);
  const currentPageItems = products.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-[#FEFCF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto">
          <Link 
            href="/" 
            className="text-[#3d2c28]/60 hover:text-[#DBA39A] transition-colors whitespace-nowrap"
          >
            Home
          </Link>
          <span className="text-[#3d2c28]/30">/</span>
          <span className="text-[#DBA39A] font-medium whitespace-nowrap">
            {category.name}
          </span>
        </nav>

        {/* Category Header */}
        <div className="relative rounded-sm overflow-hidden mb-8 shadow-lg">
          <div className="relative w-full h-52">
            <img
              src="https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782948255/CAtegory_banner_mc3vtq.png"
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center">
              <div className="text-white px-6 md:px-12 max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                  {category.name}
                </h1>
                <p className="text-lg md:text-xl mb-4 text-white/90">
                  {`Get up to 30% off on ${category.name} products!`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {category.subCategories && category.subCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-[#3d2c28]/60 mb-3">
              Subcategories
            </h2>
            <div className="flex flex-wrap gap-2">
              {category.subCategories.map((sub: SubCategory) => (
                <Link
                  key={sub.id}
                  href={`/product-category/${category.slug}/${sub.slug}`}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-[#F5EBEO] text-[#3d2c28]/70 hover:bg-[#F0DBDB] hover:text-[#3d2c28] transition-all"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Client-side Interactive Components */}
        <CategoryPageClient
          products={currentPageItems}
          category={category}
          totalProducts={total}
          currentPage={page}
          totalPages={totalPages}
          currentSort={sort}
          currentView={view}
        />
      </div>
    </div>
  );
}