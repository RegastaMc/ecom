// components/Footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Heart,
  Shield,
  Truck,
  CreditCard,
  ChevronRight,
} from "lucide-react";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const quickLinks: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Returns & Refunds", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
];

const categoryLinks: FooterLink[] = [
  { label: "Laptops", href: "/product-category/laptops" },
  { label: "Desktops", href: "/product-category/desktops" },
  { label: "Storage", href: "/product-category/storage" },
  { label: "Networking", href: "/product-category/networking" },
  { label: "Screens", href: "/product-category/screens" },
  { label: "Components", href: "/product-category/components" },
  { label: "Phones", href: "/product-category/phones" },
];

const socialLinks: SocialLink[] = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: <Facebook className="h-5 w-5" />,
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: <Twitter className="h-5 w-5" />,
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: <Youtube className="h-5 w-5" />,
  },
];

export default function Footer() {
  const pathname = usePathname();

  // Check if current page is signin/signup or admin/dashboard
  const isAuthPage =
    pathname?.includes("/signin") || pathname?.includes("/signup");
  const isAdminPage =
    pathname?.includes("/admin") || pathname?.includes("/dashboard");

  // Hide footer on auth pages and admin pages
  if (isAuthPage || isAdminPage) {
    return null;
  }

  return (
    <footer className="bg-[#FEFCF3] border-t border-[#F5EBEO]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="logo-font text-2xl tracking-tight text-[#DBA39A]">
              <span className="font-serif-italic font-light text-[#b28b7a]"></span>
              <span className="font-bold">Jethro</span>
              <span className="font-serif-italic">Laptops</span>
            </div>
            <p className="text-sm text-[#3d2c28]/60 max-w-xs">
              Your one stop shop for high quality laptops, accessories and more.
              We offer a wide range of electronic products to suit your needs.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-[#3d2c28]/70">
                <MapPin className="h-4 w-4 text-[#DBA39A] shrink-0" />
                <span>CBD Nairobi, Kenya</span>
              </div>
              <Link
                href="tel:+254717755910"
                className="flex items-center gap-3 text-sm text-[#3d2c28]/70 hover:text-[#DBA39A] transition-colors"
              >
                <Phone className="h-4 w-4 text-[#DBA39A] shrink-0" />
                <span>+254 12345678</span>
              </Link>
              <Link
                href="mailto:my_gmail.com"
                className="flex items-center gap-3 text-sm text-[#3d2c28]/70 hover:text-[#DBA39A] transition-colors"
              >
                <Mail className="h-4 w-4 text-[#DBA39A] shrink-0" />
                <span>my_gmail.com</span>
              </Link>
              <div className="flex items-center gap-3 text-sm text-[#3d2c28]/70">
                <Clock className="h-4 w-4 text-[#DBA39A] shrink-0" />
                <span>Mon - Sat: 9AM - 6PM</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-[#F5EBEO] hover:bg-[#F0DBDB] text-[#3d2c28] hover:text-[#DBA39A] transition-all duration-300"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#3d2c28] uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#3d2c28]/60 hover:text-[#DBA39A] transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-[#3d2c28] uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {categoryLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#3d2c28]/60 hover:text-[#DBA39A] transition-colors flex items-center gap-1 group"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Trust Badges */}
          <div className="space-y-6">
            {/* <div>
              <h3 className="text-sm font-semibold text-[#3d2c28] uppercase tracking-wider mb-4">
                Newsletter
              </h3>
              <p className="text-sm text-[#3d2c28]/60 mb-4">
                Subscribe to get special offers and updates
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#F5EBEO] bg-white focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] text-sm text-[#3d2c28] placeholder:text-[#b8a69c]"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#DBA39A] hover:bg-[#c49087] text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg text-sm whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div> */}

            {/* Trust Badges */}
            <div>
              <h3 className="text-sm font-semibold text-[#3d2c28] uppercase tracking-wider mb-3">
                Why Shop With Us
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-[#3d2c28]/60">
                  <Shield className="h-4 w-4 text-[#DBA39A] shrink-0" />
                  <span>100% Secure Checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3d2c28]/60">
                  <Truck className="h-4 w-4 text-[#DBA39A] shrink-0" />
                  <span>Fast & Discreet Shipping</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3d2c28]/60">
                  <CreditCard className="h-4 w-4 text-[#DBA39A] shrink-0" />
                  <span>Multiple Payment Options</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#3d2c28]/60">
                  <Heart className="h-4 w-4 text-[#DBA39A] shrink-0" />
                  <span>30-Day Satisfaction Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#F5EBEO] bg-[#FEFCF3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#3d2c28]/40 text-center sm:text-left">
              © {new Date().getFullYear()} Jethro Laptops. All rights reserved.
            </p>

            <div className="flex items-center gap-4 text-xs text-[#3d2c28]/40">
              <Link
                href="/privacy-policy"
                className="hover:text-[#DBA39A] transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="w-px h-3 bg-[#F5EBEO]" />
              <Link
                href="/terms"
                className="hover:text-[#DBA39A] transition-colors"
              >
                Terms of Service
              </Link>
              <span className="w-px h-3 bg-[#F5EBEO]" />
              <Link
                href="/cookies"
                className="hover:text-[#DBA39A] transition-colors"
              >
                Cookies
              </Link>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2 text-xs text-[#3d2c28]/40">
              <span className="font-medium">We Accept:</span>
              <span className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-[#F5EBEO] rounded text-[10px]">
                  Visa
                </span>
                <span className="px-1.5 py-0.5 bg-[#F5EBEO] rounded text-[10px]">
                  MC
                </span>
                {/* <span className="px-1.5 py-0.5 bg-[#F5EBEO] rounded text-[10px]">
                  Amex
                </span> */}
                <span className="px-1.5 py-0.5 bg-[#F5EBEO] rounded text-[10px]">
                  M-Pesa
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
