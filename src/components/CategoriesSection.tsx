"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ============================================================
// TYPES
// ============================================================
interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  subCategories?: SubCategory[];
  productCount?: number;
}

interface CategoryCarouselProps {
  categories: Category[];
  autoSlideInterval?: number;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
    largeDesktop: number;
  };
  onCategoryClick?: (category: Category) => void;
  onSubCategoryClick?: (category: Category, subCategory: SubCategory) => void;
}

// ============================================================
// ICON COMPONENTS
// ============================================================
const Icons = {
  ChevronLeft: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
};

// ============================================================
// CATEGORY CAROUSEL COMPONENT
// ============================================================
const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  autoSlideInterval = 2000,
  itemsPerView = {
    mobile: 3,
    tablet: 4,
    desktop: 5,
    largeDesktop: 6,
  },
  onCategoryClick,
  onSubCategoryClick,
}) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState(itemsPerView.desktop);
  const [showSubCategory, setShowSubCategory] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Create infinite loop by duplicating items
  const getInfiniteCategories = useCallback(() => {
    if (categories.length === 0) return [];
    // Duplicate categories to create infinite loop effect
    return [...categories, ...categories, ...categories];
  }, [categories]);

  const infiniteCategories = getInfiniteCategories();
  const totalItems = infiniteCategories.length;
  const realTotal = categories.length;

  // Get visible items based on screen size
  const getVisibleItems = useCallback(() => {
    if (typeof window === "undefined") return itemsPerView.desktop;
    const width = window.innerWidth;
    if (width < 640) return itemsPerView.mobile;
    if (width < 768) return itemsPerView.tablet;
    if (width < 1024) return itemsPerView.desktop;
    return itemsPerView.largeDesktop;
  }, [itemsPerView]);

  // Update visible items on resize
  useEffect(() => {
    const handleResize = () => {
      const newVisibleItems = getVisibleItems();
      setVisibleItems(newVisibleItems);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getVisibleItems]);

  // Handle infinite scroll - reset position when reaching the end
  const handleInfiniteScroll = useCallback(
    (newIndex: number) => {
      const maxIndex = totalItems - visibleItems;
      const middleIndex = Math.floor(totalItems / 3);

      // If we've reached the end of the duplicated array, jump back to the middle
      if (newIndex >= maxIndex) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex(middleIndex);
          setIsTransitioning(false);
        }, 50);
        return middleIndex;
      }

      // If we've reached the beginning, jump to the middle
      if (newIndex < 0) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex(middleIndex);
          setIsTransitioning(false);
        }, 50);
        return middleIndex;
      }

      return newIndex;
    },
    [totalItems, visibleItems],
  );

  // Auto-slide functionality with infinite loop
  useEffect(() => {
    if (isPaused || categories.length <= visibleItems || isTransitioning) {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
      return;
    }

    autoSlideTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1;
        return handleInfiniteScroll(nextIndex);
      });
    }, autoSlideInterval);

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
    };
  }, [
    isPaused,
    categories.length,
    visibleItems,
    autoSlideInterval,
    isTransitioning,
    handleInfiniteScroll,
  ]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(handleInfiniteScroll(nextIndex));
      } else {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(handleInfiniteScroll(prevIndex));
      }
    }
    setTouchStartX(null);
    setIsPaused(false);
  };

  // Navigation handlers
  const goToPrevious = () => {
    const prevIndex = currentIndex - 1;
    setCurrentIndex(handleInfiniteScroll(prevIndex));
  };

  const goToNext = () => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(handleInfiniteScroll(nextIndex));
  };

  // Handle category click
  const handleCategoryClick = (category: Category) => {
    onCategoryClick?.(category);
    router.push(`/product-category/${category.slug}`);
  };

  // Handle subcategory click
  const handleSubCategoryClick = (
    category: Category,
    subCategory: SubCategory,
  ) => {
    onSubCategoryClick?.(category, subCategory);
    router.push(`/product-category/${category.slug}/${subCategory.slug}`);
  };

  // Calculate if navigation buttons should be shown
  const showNavigation = categories.length > visibleItems;

  // Get current visible categories
  //   const getVisibleCategories = () => {
  //     const start = currentIndex;
  //     const end = start + visibleItems;
  //     return infiniteCategories.slice(start, end);
  //   };

  //   const visibleCategories = getVisibleCategories();

  // If no categories, show empty state
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#3d2c28]/60">No categories available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl  font-bold text-[#3d2c28]">
            Popular Categories
          </h2>
          {/* <p className="text-sm text-[#3d2c28]/60 mt-1">Explore our curated collections</p> */}
        </div>
        {showNavigation && (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-full border border-[#F5EBEO] hover:border-[#DBA39A] hover:bg-[#F5EBEO] text-[#3d2c28] transition-all"
              aria-label="Previous categories"
            >
              <Icons.ChevronLeft />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-full border border-[#F5EBEO] hover:border-[#DBA39A] hover:bg-[#F5EBEO] text-[#3d2c28] transition-all"
              aria-label="Next categories"
            >
              <Icons.ChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`flex transition-transform duration-500 ease-in-out ${
            isTransitioning ? "transition-none" : ""
          }`}
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }}
        >
          {infiniteCategories.map((category, index) => (
            <div
              key={`${category.id}-${index}`}
              className="shrink-0 px-1"
              style={{ width: `${100 / visibleItems}%` }}
            >
              <CategoryCard
                category={category}
                onCategoryClick={handleCategoryClick}
                onSubCategoryClick={handleSubCategoryClick}
                showSubCategory={showSubCategory === category.id}
                onToggleSubCategory={() =>
                  setShowSubCategory(
                    showSubCategory === category.id ? null : category.id,
                  )
                }
              />
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        {/* {showNavigation && !isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F5EBEO] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#DBA39A] rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentIndex % categories.length) / categories.length) * 100}%` 
              }}
            />
          </div>
        )} */}
      </div>

      {/* Dot Indicators */}
      {/* {showNavigation && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: categories.length }).map((_, index) => {
            const isActive = (currentIndex % categories.length) === index;
            return (
              <button
                key={index}
                onClick={() => {
                  const middleIndex = Math.floor(infiniteCategories.length / 3);
                  const targetIndex = middleIndex + index;
                  setCurrentIndex(handleInfiniteScroll(targetIndex));
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-8 bg-[#DBA39A] shadow-md'
                    : 'w-2.5 bg-[#DBA39A]/30 hover:bg-[#DBA39A]/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )} */}
    </div>
  );
};

interface CategoryCardProps {
  category: Category;
  onCategoryClick: (category: Category) => void;
  onSubCategoryClick: (category: Category, subCategory: SubCategory) => void;
  showSubCategory: boolean;
  onToggleSubCategory: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onCategoryClick,
  onSubCategoryClick,
  showSubCategory,
  onToggleSubCategory,
}) => {
  const hasSubCategories =
    category.subCategories && category.subCategories.length > 0;

  return (
    <div className="flex flex-col items-center ">
      {/* Category Image - Fully Rounded */}
      <button
        onClick={() => onCategoryClick(category)}
        className="group relative w-full aspect-square max-w-50 mx-auto"
        aria-label={`Browse ${category.name}`}
      >
        <div className="w-full h-full rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 border-4 border-white">
          <Image
            src={category.image || ""}
            alt={category.name}
            className="w-full h-full cursor-pointer object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&size=200&background=DBA39A&color=ffffff&bold=true`;
            }}
            height={200}
            width={200}
          />
        </div>

        {/* Decorative ring on hover */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent group-hover:border-[#DBA39A]/30 transition-all duration-300 pointer-events-none" />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-full bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Product count badge
        {category.productCount !== undefined && category.productCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#DBA39A] text-white text-xs font-bold rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center shadow-md">
            {category.productCount}
          </span>
        )} */}
      </button>

      {/* Category Name */}
      <div className="text-center mt-3">
        <button
          onClick={() => onCategoryClick(category)}
          className="font-semibold text-[#3d2c28] text-sm cursor-pointer sm:text-base hover:text-[#DBA39A] transition-colors"
        >
          {category.name}
        </button>
        {/* {category.description && (
          <p className="text-xs text-[#3d2c28]/60 mt-0.5 truncate max-w-[120px] mx-auto">
            {category.description}
          </p>
        )} */}
      </div>

      {/* Subcategories */}
      {/* {hasSubCategories && (
        <div className="mt-2 w-full">
          <button
            onClick={onToggleSubCategory}
            className="text-xs text-[#DBA39A] hover:underline flex items-center gap-1 mx-auto"
          >
            {showSubCategory ? 'Hide subcategories' : `Show ${category.subCategories?.length} subcategories`}
            <svg
              className={`w-3 h-3 transition-transform ${showSubCategory ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showSubCategory && category.subCategories && (
            <div className="mt-2 p-2 bg-[#F5EBEO]/50 rounded-xl space-y-1">
              {category.subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => onSubCategoryClick(category, sub)}
                  className="w-full text-left px-3 py-1.5 text-sm text-[#3d2c28] hover:bg-[#F0DBDB] rounded-lg transition-colors"
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Laptops",
    slug: "laptops",
    image:
      "https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782932804/laptops_qw9yy.webp",
    description: "",
    productCount: 10,
    subCategories: [
      { id: "1a", name: "", slug: "" },
      {
        id: "1b",
        name: "e",
        slug: "",
      },
      { id: "1c", name: "", slug: "" },
      { id: "1d", name: " ", slug: "" },
      { id: "1e", name: "   ", slug: "" },
      { id: "1f", name: "", slug: "" },
      { id: "1g", name: " ", slug: "" },
    ],
  },
  {
    id: "2",
    name: "Men",
    slug: "men",
    image:
      "https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782955950/dildos_eezbvp.webp",
    description: "Modern & classic",
    productCount: 98,
    subCategories: [
      { id: "2a", name: "Male Condoms", slug: "male-condoms" },
      { id: "2b", name: "Male Masturbators", slug: "male-masturbators" },
      { id: "2c", name: "Men Accessories", slug: "men-accessories" },
      {
        id: "2d",
        name: "Sexy Underwear For Men",
        slug: "sexy-underwear-for-men",
      },
      { id: "2e", name: "Anal Toys For Men", slug: "anal-toys-for-men" },
      { id: "2f", name: "Cock Rings", slug: "cock-rings" },
      { id: "2g", name: "Larger Penis", slug: "larger-penis" },
    ],
  },
  {
    id: "3",
    name: "Combos",
    slug: "combos",
    image:
      "https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782956562/combos1_sz0ems.webp",
    description: "Fun & colorful",
    productCount: 5,
    subCategories: [],
  },
  {
    id: "4",
    name: "Couples",
    slug: "couples",
    image:
      "https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782955950/couples_wxc9jx.webp",
    description: "Complete your look",
    productCount: 134,
    subCategories: [
      { id: "4a", name: "Couples Sex Toys", slug: "couples-sex-toys" },
      { id: "4b", name: "Foreplay", slug: "foreplay" },
      { id: "4c", name: "Light Bondage", slug: "light-bondage" },
      { id: "4d", name: "Strap Ons", slug: "strap-ons" },
      {
        id: "4e",
        name: "Accessories And Games",
        slug: "accessories-and-games",
      },
      { id: "4f", name: "Strap Ons", slug: "strap-ons" },
    ],
  },
  {
    id: "5",
    name: "BDSM",
    slug: "bdsm",
    image:
      "https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782955950/BDSM_tipb4p.webp",
    description: "Step in style",
    productCount: 89,
    subCategories: [
      { id: "5a", name: "Fetish Wear", slug: "fetish-wear" },
      { id: "5b", name: "Kinky Sex Toys", slug: "kinky-sex-toys" },
      { id: "5c", name: "Sex Machines", slug: "sex-machines" },
      {
        id: "5d",
        name: "Sex Whips And Paddles",
        slug: "sex-whips-and-paddles",
      },
      { id: "5e", name: "BDSM Accessories", slug: "bdsm-accessories" },
      { id: "5f", name: "Bondage Restraints", slug: "bondage-restraints" },
      {
        id: "5g",
        name: "Chastity Devices And Cages",
        slug: "chastity-devices-and-cages",
      },
      {
        id: "5h",
        name: "Clamps,Pumps And Suction Cups",
        slug: "clamps-pumps-and-suction-cups",
      },
      {
        id: "5i",
        name: "Electro And Medical Toys",
        slug: "electro-and-medical-toys",
      },
    ],
  },
  {
    id: "6",
    name: "Sexy Underwear & Lingerie",
    slug: "sexy-underwear-and-lingerie",
    image:
      "https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782955951/Sexy-Underwear_hu5loc.webp",
    description: "Glow & shine",
    productCount: 112,
    subCategories: [
      { id: "6a", name: "Sexy Costumes", slug: "sexy-costumes" },
      {
        id: "6b",
        name: "Stockings And Hosiery",
        slug: "stockings-and-hosiery",
      },
      { id: "6c", name: "Suspender Belts", slug: "suspender-belts" },
      {
        id: "6d",
        name: "Thongs,Strings and Knickers",
        slug: "thongs-strings-and-knickers",
      },
      { id: "6e", name: "Basques And Corsets", slug: "basques-and-corsets" },
      { id: "6f", name: "Body Stockings", slug: "body-stockings" },
      { id: "6g", name: "Christmas Lingerie", slug: "christmas-lingerie" },
      { id: "6h", name: "Chrotchless Lingerie", slug: "chrotchless-lingerie" },
      { id: "6i", name: "Nightdresses", slug: "nightdresses" },
    ],
  },
  {
    id: "7",
    name: "Flowers",
    slug: "flowers",
    image:
      "https://res.cloudinary.com/dz1m2mfnv/image/upload/v1782956466/flowers_klqrqu.webp",
    description: "Cozy & modern",
    productCount: 78,
    subCategories: [],
  },
];

const CategoriesSection: React.FC = () => {
  const handleCategoryClick = (category: Category) => {
    console.log("Category clicked:", category.name);
  };

  const handleSubCategoryClick = (
    category: Category,
    subCategory: SubCategory,
  ) => {
    console.log("Subcategory clicked:", subCategory.name, "in", category.name);
  };

  return (
    <div className="max-w-7xl py-12">
      <CategoryCarousel
        categories={mockCategories}
        autoSlideInterval={2000}
        itemsPerView={{
          mobile: 3,
          tablet: 4,
          desktop: 5,
          largeDesktop: 6,
        }}
        onCategoryClick={handleCategoryClick}
        onSubCategoryClick={handleSubCategoryClick}
      />
    </div>
  );
};

export default CategoriesSection;
export { CategoryCarousel, CategoryCard, mockCategories };
