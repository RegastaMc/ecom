"use client";

import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import SearchBar from "./components/Ui/SearchBar";
import AccountDropdown from "./AccountDropdown";
import CartSlide from "./CartSlide";
import { useRouter, usePathname } from "next/navigation";
import type { NavCategory } from "@/lib/queries/categories";

type NavbarProps = {
  categories: NavCategory[];
};

export default function Navbar({ categories }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const user = (session?.user as any) || null;

  const isAdminPage =
    pathname?.includes("/admin") || pathname?.includes("/dashboard");

  // Outside click / escape handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDesktopMenu(null);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const menuButton = document.getElementById("menuToggle");
        if (menuButton && !menuButton.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setOpenDesktopMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Close everything on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDesktopMenu(null);
    setOpenMobileMenu(null);
  }, [pathname]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const Register = () => router.push("/signup");
  const Login = () => router.push("/signin");
  const handleSignOut = async () => signOut({ callbackUrl: "/" });

  if (isAdminPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#F5EBE0] bg-[#253C6D] shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* LEFT */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile menu toggle */}
            <button
              id="menuToggle"
              onClick={toggleMenu}
              className="rounded-md p-2 transition-colors hover:bg-[#F0DBDB]/20 md:hidden"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6 text-white"
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
            <Link
              href="/"
              className="logo-font cursor-pointer text-2xl tracking-tight text-white md:text-3xl"
            >
              <span className="font-bold">Jethro</span>
              <span className="font-serif-italic">Laptops</span>
            </Link>

            {/* Desktop categories */}
            <div
              ref={dropdownRef}
              className="ml-6 hidden items-center gap-1 text-sm font-medium md:flex"
            >
              {categories.map((category) => {
                const isOpen = openDesktopMenu === category.id;
                const hasSubs = category.subCategories.length > 0;

                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() =>
                      hasSubs && setOpenDesktopMenu(category.id)
                    }
                    onMouseLeave={() => setOpenDesktopMenu(null)}
                  >
                    <Link
                      href={`/product-category/${category.slug}`}
                      className="flex items-center gap-1 rounded-full px-3 py-2 uppercase text-white transition-colors hover:bg-[#F0DBDB]/20 hover:text-[#DBA39A]"
                    >
                      {category.name}
                      {hasSubs && (
                        <ChevronDown
                          className={`size-3 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Link>

                    {/* Dropdown */}
                    {hasSubs && isOpen && (
                      <div className="absolute left-0 top-full z-50 min-w-[220px] overflow-hidden rounded-xl border border-[#F5EBE0] bg-white py-2 shadow-xl">
                        <Link
                          href={`/product-category/${category.slug}`}
                          className="block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#b8a69c] hover:bg-[#F5EBE0]/40"
                        >
                          All {category.name}
                        </Link>
                        <div className="my-1 h-px bg-[#F5EBE0]" />
                        {category.subCategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/product-category/${category.slug}?sub=${sub.slug}`}
                            className="block px-4 py-2 text-sm text-[#3d2c28] transition hover:bg-[#F0DBDB]/40 hover:text-[#DBA39A]"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3 md:gap-4">
            <AccountDropdown
              onSignIn={Login}
              onSignUp={Register}
              user={user}
              onSignOut={handleSignOut}
            />
            <CartSlide />
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="w-full pb-3 md:pb-4">
          <div className="relative mx-auto w-full max-w-2xl md:mx-0">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        ref={menuRef}
        className={`overflow-hidden border-t border-[#F5EBE0] bg-[#F5EBE0]/90 backdrop-blur-sm transition-all duration-200 md:hidden ${
          isMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="max-h-[80vh] space-y-1 overflow-y-auto px-4 py-4 text-sm font-medium">
          {/* Categories */}
          {categories.length > 0 ?
            categories.map((category) => {
              const isOpen = openMobileMenu === category.id;
              const hasSubs = category.subCategories.length > 0;

              return (
                <div key={category.id}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/product-category/${category.slug}`}
                      onClick={closeMenu}
                      className="flex-1 rounded-lg px-3 py-2.5 text-[#3d2c28] transition hover:bg-[#F0DBDB]"
                    >
                      {category.name}
                    </Link>
                    {hasSubs && (
                      <button
                        onClick={() =>
                          setOpenMobileMenu(isOpen ? null : category.id)
                        }
                        className="rounded-md p-2 transition hover:bg-[#F0DBDB]"
                        aria-label="Toggle subcategories"
                      >
                        <ChevronDown
                          className={`size-4 text-[#3d2c28] transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasSubs && isOpen && (
                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-[#DBA39A]/40 pl-3">
                      {category.subCategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/product-category/${category.slug}?sub=${sub.slug}`}
                          onClick={closeMenu}
                          className="block rounded-lg px-3 py-2 text-[#3d2c28]/80 transition hover:bg-[#F0DBDB] hover:text-[#3d2c28]"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          : <div className="rounded-lg bg-white/50 px-3 py-4 text-center text-xs text-[#3d2c28]/50">
              No categories available
            </div>
          }

          <div className="my-2 border-t border-[#F0DBDB]/50" />

          {/* Account */}
          <Link
            href={user ? "/account" : "/signin"}
            onClick={closeMenu}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[#3d2c28] transition hover:bg-[#F0DBDB]"
          >
            <User className="size-5" />
            {user ? "My Account" : "Sign In"}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            onClick={closeMenu}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[#3d2c28] transition hover:bg-[#F0DBDB]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
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
          </Link>

          {/* Sign out */}
          {user && (
            <>
              <div className="my-2 border-t border-[#F0DBDB]/50" />
              <button
                onClick={() => {
                  closeMenu();
                  handleSignOut();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="size-5" />
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
