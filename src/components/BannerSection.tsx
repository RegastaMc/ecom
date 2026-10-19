// components/BannerSection.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBanners } from '@/app/actions/banner';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  buttonText: string;
  buttonLink: string;
  type: 'PRIMARY' | 'SECONDARY';
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BannerSectionProps {
  primaryBanner?: Banner;
  secondaryBanner?: Banner;
}

const BannerSection: React.FC<BannerSectionProps> = ({
  primaryBanner: propPrimaryBanner,
  secondaryBanner: propSecondaryBanner,
}) => {
  const [primaryBanner, setPrimaryBanner] = useState<Banner | null>(
    propPrimaryBanner || null
  );
  const [secondaryBanner, setSecondaryBanner] = useState<Banner | null>(
    propSecondaryBanner || null
  );
  const [loading, setLoading] = useState(!propPrimaryBanner);

  // Fallback default banners if none are provided
  const defaultPrimary: Banner = {
    id: 'default-primary',
    title: "Celebrating men's mental health month",
    subtitle: 'Up to 50% off',
    description: 'on all toys',
    image: '/Banner_men.jpg',
    buttonText: 'Shop Now',
    buttonLink: '#',
    type: 'PRIMARY',
    isActive: true,
    order: 0,
  };

  const defaultSecondary: Banner = {
    id: 'default-secondary',
    title: 'New Collection',
    subtitle: 'Limited Edition',
    description: 'Top Selling Women Vibrators',
    image: '/Banner_women.jpg',
    buttonText: 'Shop Now',
    buttonLink: '#',
    type: 'SECONDARY',
    isActive: true,
    order: 0,
  };

  // Fetch banners from database if not provided as props
  useEffect(() => {
    if (!propPrimaryBanner || !propSecondaryBanner) {
      const fetchBanners = async () => {
        try {
          const result = await getBanners();
          if (result.success && result.data) {
            const primary = result.data.find((b) => b.type === 'PRIMARY' && b.isActive) as Banner | undefined;
            const secondary = result.data.find((b) => b.type === 'SECONDARY' && b.isActive) as Banner | undefined;
            
            if (primary) setPrimaryBanner(primary);
            if (secondary) setSecondaryBanner(secondary);
          }
        } catch (error) {
          console.error('Error fetching banners:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchBanners();
    } else {
      setLoading(false);
    }
  }, [propPrimaryBanner, propSecondaryBanner]);

  if (loading) {
    return (
      <div className="relative w-full pt-4 md:pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-md overflow-hidden bg-gray-200 animate-pulse h-50 sm:h-62.5 md:h-70 lg:h-80" />
          <div className="md:col-span-1 rounded-md overflow-hidden bg-gray-200 animate-pulse h-50 sm:h-62.5 md:h-70 lg:h-80" />
        </div>
      </div>
    );
  }

  const primary = (primaryBanner || defaultPrimary) as Banner;
  const secondary = (secondaryBanner || defaultSecondary) as Banner;

  return (
    <div className='relative w-full pt-4 md:pt-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Primary Banner - Takes 2/3 */}
        <div className='md:col-span-2 rounded-md overflow-hidden shadow-lg relative group'>
          <div className='relative w-full h-50 sm:h-62.5 md:h-70 lg:h-80'>
            <Image
              src={primary.image}
              alt={primary.title}
              fill
              priority
              className='object-cover group-hover:scale-105 transition-transform duration-700'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw'
            />
            <div className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent' />
            
            <div className='absolute inset-0 flex items-center'>
              <div className='text-white px-6 md:px-10 max-w-xl'>
                {primary.subtitle && (
                  <p className='text-sm md:text-base font-medium text-[#F0DBDB] tracking-wider uppercase mb-2'>
                    {primary.subtitle}
                  </p>
                )}
                <h1 className='text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight'>
                  {primary.title}
                </h1>
                {primary.description && (
                  <p className='text-base md:text-lg mb-4 text-white/90'>
                    {primary.description}
                  </p>
                )}
                <Link
                  href={primary.buttonLink}
                  className='inline-block bg-[#DBA39A] hover:bg-[#c49087] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105'
                >
                  {primary.buttonText}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Banner - Takes 1/3 */}
        <div className='md:col-span-1 rounded-md overflow-hidden shadow-lg relative group'>
          <div className='relative w-full h-50 sm:h-62.5 md:h-70 lg:h-80'>
            <Image
              src={secondary.image}
              alt={secondary.title}
              fill
              className='object-cover group-hover:scale-105 transition-transform duration-700'
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
            
            <div className='absolute inset-0 flex items-end md:items-center p-6'>
              <div className='text-white w-full'>
                {secondary.subtitle && (
                  <p className='text-xs md:text-sm font-medium text-[#F0DBDB] tracking-wider uppercase mb-1'>
                    {secondary.subtitle}
                  </p>
                )}
                <h2 className='text-lg md:text-xl lg:text-2xl font-bold mb-1 leading-tight'>
                  {secondary.title}
                </h2>
                {secondary.description && (
                  <p className='text-sm md:text-base mb-3 text-white/90'>
                    {secondary.description}
                  </p>
                )}
                <Link
                  href={secondary.buttonLink}
                  className='inline-block bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-5 md:px-6 py-2 rounded-xl font-semibold transition-all border border-white/30 hover:border-white/50'
                >
                  {secondary.buttonText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className='absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-[#F5EBEO]/30 rounded-full blur-3xl' />
    </div>
  );
};

export default BannerSection;