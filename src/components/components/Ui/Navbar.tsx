"use client"
import AccountDropdown from '@/components/AccountDropdown';
import CartSlide from '@/components/CartSlide';
import React, { useState, useRef, useEffect } from 'react';


interface NavItem {
  label: string;
  href: string;
}

interface Recommendation {
  id: string;
  label: string;
}

// --- Data ---
const categories: NavItem[] = [
  { label: 'Women', href: '#' },
  { label: 'Men', href: '#' },
  { label: 'Couples', href: '#' },
  { label: 'Combos', href: '#' },
  {label:"Bdsm", href:'#'}
];

const recommendations: Recommendation[] = [
  { id: '1', label: 'men' },
  { id: '2', label: 'women' },
  { id: '3', label: 'couples' },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
  const [filteredRecommendations, setFilteredRecommendations] = useState<Recommendation[]>(recommendations);

  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (): void => setIsMenuOpen((prev) => !prev);
  const closeMenu = (): void => setIsMenuOpen(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === '') {
      setFilteredRecommendations(recommendations);
    } else {
      const filtered = recommendations.filter((rec) =>
        rec.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRecommendations(filtered);
    }
  };

  const handleSearchFocus = (): void => {
    setShowRecommendations(true);
  };

  const handleRecommendationClick = (label: string): void => {
    setSearchQuery(label);
    setShowRecommendations(false);
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowRecommendations(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const menuButton = document.getElementById('menuToggle');
        if (menuButton && !menuButton.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setShowRecommendations(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <nav className="w-full bg-[#FEFCF3] border-b border-[#F5EBEO] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16 md:h-20">

          <div className="flex items-center gap-2 md:gap-4">

            <button
              id="menuToggle"
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md hover:bg-[#F0DBDB] transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#3d2c28]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>

            <div className="logo-font text-2xl md:text-3xl tracking-tight text-[#DBA39A]">
              <span className="font-serif-italic font-light text-[#b28b7a]">✧</span>
              <span className="font-bold">Wink&</span>
              <span className="font-serif-italic">Wonder</span>
            </div>

            <div className="hidden md:flex items-center space-x-1 ml-6 text-sm font-medium">
              {categories.map((category) => (
                <a
                  key={category.label}
                  href={category.href}
                  className="category-link px-3 py-2 rounded-full transition-colors hover:text-[#DBA39A] hover:bg-[#F0DBDB]/20"
                >
                  {category.label.toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">

           <AccountDropdown  />

            {/* Cart (end on small) */}
           <CartSlide />
          </div>
        </div>

        {/* ===== SEARCH BAR (wrapped element below navbar) ===== */}
        <div className="pb-3 md:pb-4 w-full" ref={searchRef}>
          <div className="relative w-full max-w-2xl mx-auto md:mx-0">
            <input
              type="text"
              placeholder="Search your items..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              className="search-input w-full py-2.5 px-5 pr-12 rounded-full border border-[#e0d3cd] bg-[#F5EBEO]/50 focus:bg-white focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 transition placeholder:text-[#b8a69c] text-[#2d1f1a] text-sm md:text-base"
              aria-label="Search products"
              aria-expanded={showRecommendations}
              aria-controls="recommendations"
            />
            
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#DBA39A]/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Recommendations dropdown */}
            {showRecommendations && filteredRecommendations.length > 0 && (
              <div
                id="recommendations"
                className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-[#F5EBEO] divide-y divide-[#F5EBEO] z-10"
                role="listbox"
              >
                <div className="px-4 py-2 text-sm text-[#DBA39A]/80 font-medium">
                  Suggestions
                </div>
                {filteredRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="px-4 py-2 hover:bg-[#F5EBEO]/50 text-[#3d2c28] text-sm cursor-pointer transition-colors"
                    onClick={() => handleRecommendationClick(rec.label)}
                    role="option"
                    aria-selected
                    
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRecommendationClick(rec.label);
                      }
                    }}
                  >
                    {rec.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE MENU ===== */}
      <div
        ref={menuRef}
        className={`md:hidden bg-[#F5EBEO]/70 backdrop-blur-sm border-t border-[#F5EBEO] transition-all duration-200 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-4 py-4 space-y-2 text-sm font-medium">
          {categories.map((category) => (
            <a
              key={category.label}
              href={category.href}
              className="block px-3 py-2 rounded-lg hover:bg-[#F0DBDB] transition"
              onClick={closeMenu}
            >
              {category.label}
            </a>
          ))}
          <div className="border-t border-[#F0DBDB]/50 my-2"></div>
          <a
            href="#"
            className="block px-3 py-2 rounded-lg hover:bg-[#F0DBDB] transition flex items-center gap-2"
            onClick={closeMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-lg hover:bg-[#F0DBDB] transition flex items-center gap-2"
            onClick={closeMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 006 17h12a1 1 0 001-1v-1M7 13h10M5 21h2M17 21h2"
              />
            </svg>
            Cart (3)
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;