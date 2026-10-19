"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Home, LogOut, Search, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import SearchBar from "./components/Ui/SearchBar";
import AccountDropdown from "./AccountDropdown";
import CartSlide from "./CartSlide";
import { useRouter, usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

// --- Data ---

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [categories, setCategories] = useState<NavItem[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const user = (session?.user as any) || null;

  // Check if current path is an admin page
  const isAdminPage =
    pathname?.includes("/admin") || pathname?.includes("/dashboard");

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      // Close mobile menu
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const menuButton = document.getElementById("menuToggle");
        if (menuButton && !menuButton.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const toggleMenu = (): void => setIsMenuOpen((prev) => !prev);
  const closeMenu = (): void => setIsMenuOpen(false);

  const Register = () => {
    router.push("/signup");
  };

  const Login = () => {
    router.push("/signin");
  };

  // If on admin page, don't render the navbar
  if (isAdminPage) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#253C6D] border-b border-[#F5EBEO] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Menu Toggle */}
            <button
              id="menuToggle"
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md hover:bg-[#F0DBDB] transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
                  d={
                    isMenuOpen ?
                      "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>

            {/* Logo */}
            <div
              className="logo-font text-2xl md:text-3xl cursor-pointer tracking-tight text-[#ffffff]"
              onClick={() => router.push("/")}
            >
              {/* <span className="font-serif-italic font-light text-[#b28b7a]">
                ✧
              </span> */}
              <span className="font-bold">Jethro</span>
              <span className="font-serif-italic">Laptops</span>
            </div>

            {/* Desktop Categories */}
            {/* <div className="hidden md:flex items-center space-x-1 ml-6 text-sm font-medium">
              {categories.map((category, index) => (
                <Link
                  key={`${category.slug}-${index}`}
                  href={`/product-category/${category.slug}`}
                  className="category-link px-3 py-2 rounded-full transition-colors hover:text-[#DBA39A] hover:bg-[#F0DBDB]/20 text-[#fffdfd]"
                >
                  {category.name.toUpperCase()}
                </Link>
              ))}
            </div> */}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Account Dropdown */}
            <AccountDropdown
              onSignIn={Login}
              onSignUp={Register}
              user={user}
              onSignOut={handleSignOut}
            />

            {/* Cart Slide */}
            <CartSlide />
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="pb-3 md:pb-4 w-full">
          <div className="relative w-full max-w-2xl mx-auto md:mx-0">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        ref={menuRef}
        className={`md:hidden bg-[#F5EBEO]/70 backdrop-blur-sm border-t border-[#F5EBEO] transition-all duration-200 overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-4 py-4 space-y-2 text-sm font-medium">
          {/* {categories.map((category) => (
            <a
              key={category.name}
              href={`/product-category/${category.slug}`}
              className="block px-3 py-2 rounded-lg hover:bg-[#F0DBDB] transition text-[#fffdfd]"
              onClick={closeMenu}
            >
              {category.name}
            </a>
          ))} */}
          <div className="border-t border-[#F0DBDB]/50 my-2"></div>
          <a
            href="#"
            className=" px-3 py-2 rounded-lg hover:bg-[#F0DBDB] transition flex items-center gap-2 text-[#fcf7f6]"
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
            My Account
          </a>
          <a
            href="#"
            className="block px-3 py-2 rounded-lg hover:bg-[#F0DBDB] transition items-center gap-2 text-[#fffefe]"
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
            Cart
          </a>
        </div>
      </div>
    </nav>
  );
}
