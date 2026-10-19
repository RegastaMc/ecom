"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ContactRound,
  LayoutDashboard,
  ListOrdered,
  Package,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  UserCircle,
  HelpCircle,
  TicketSlash,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-toastify";

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onSignOut: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ");
      return names
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm border border-[#F5EBEO] hover:border-[#DBA39A]/30 transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.image ?
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
        : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DBA39A] text-sm font-bold text-white">
            {getUserInitials()}
          </div>
        }

        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold text-[#3d2c28]">
            {user?.name || "Admin User"}
          </p>
          <p className="text-xs text-[#3d2c28]/60">
            {user?.email || "admin@example.com"}
          </p>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-[#3d2c28]/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#F5EBEO] py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-[#F5EBEO]">
            <div className="flex items-center gap-3">
              {user?.image ?
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DBA39A] text-white font-bold">
                  {getUserInitials()}
                </div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#3d2c28] text-sm truncate">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-[#3d2c28]/60 truncate">
                  {user?.email || "admin@example.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          {/* <div className="py-1">
            <Link
              href="/admin/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3d2c28] hover:bg-[#F5EBEO] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserCircle className="h-4 w-4 text-[#DBA39A]" />
              <span>My Profile</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3d2c28] hover:bg-[#F5EBEO] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 text-[#DBA39A]" />
              <span>Settings</span>
            </Link>
            <Link
              href="/admin/help"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3d2c28] hover:bg-[#F5EBEO] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle className="h-4 w-4 text-[#DBA39A]" />
              <span>Help & Support</span>
            </Link>
          </div> */}

          <div className="border-t border-[#F5EBEO] pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    toast.success(newIsDark ? "Dark mode enabled" : "Light mode enabled");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-[#F5EBEO] hover:bg-[#F0DBDB] transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ?
        <Sun className="h-5 w-5 text-[#DBA39A]" />
      : <Moon className="h-5 w-5 text-[#DBA39A]" />}
    </button>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarLinks = [
    {
      name: "Overview",
      path: "/admin/dashboard/id/overview",
      icon: LayoutDashboard,
      description: "View your dashboard summary ",
    },
    {
      name: "Products",
      path: "/admin/dashboard/id/products",
      icon: Package,
      description: "Manage your products",
    },
    {
      name: "Categories",
      path: "/admin/dashboard/id/categories",
      icon: ListOrdered,
      description: "Organize your products",
    },
    {
      name: "Banners",
      path: "/admin/dashboard/id/banners",
      icon: TicketSlash,
      description: "Manage homepage banners",
    },
    {
      name: "Orders",
      path: "/admin/dashboard/id/orders",
      icon: ListOrdered,
      description: "Track and fulfill orders",
    },
    // {
    //   name: 'Communication',
    //   path: '/admin/dashboard/id/contacts',
    //   icon: ContactRound,
    //   description: 'Customer messages',
    // },
    {
      name: "Users",
      path: "/admin/dashboard/id/customers",
      icon: User,
      description: "Manage your customer base",
    },
  ];

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast.success("Signed out successfully");
    router.push("/");
  };

  const user = session?.user || {
    name: "Admin User",
    email: "admin@example.com",
  };

  return (
    <div className="min-h-screen bg-[#FEFCF3] dark:bg-[#1a1a2e] transition-colors duration-300">
      {/* Top Navbar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-[#F5EBEO] dark:border-[#2d2d44] bg-white/70 dark:bg-[#16213e]/90 backdrop-blur-xl px-4 md:px-8 py-4 shadow-sm transition-colors duration-300">
        <Link href="/" className="flex items-center gap-3">
          {/* <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-[#F5EBEO] dark:border-[#2d2d44] shadow-sm">
            <Image
              src="/biggBanner.jpg"
              alt="logo"
              fill
              className="object-cover"
            />
          </div> */}

          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-[#3d2c28] dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-xs text-[#3d2c28]/60 dark:text-gray-400">
              Manage Jethro Laptops
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Dropdown */}
          <UserDropdown user={user} onSignOut={handleSignOut} />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Sticky and Independent Scroll */}
        <aside
          className={`sticky top-18.25 h-[calc(100vh-73px)] border-r border-[#F5EBEO] dark:border-[#2d2d44] bg-white/60 dark:bg-[#16213e]/90 backdrop-blur-xl shadow-sm transition-all duration-300 overflow-y-auto ${
            isSidebarCollapsed ? "w-20" : "w-20 md:w-72"
          }`}
        >
          <div className="px-3 py-6">
            {/* Collapse Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex items-center justify-center w-full mb-4 p-2 rounded-xl bg-[#F5EBEO] dark:bg-[#2d2d44] hover:bg-[#F0DBDB] dark:hover:bg-[#3d3d5c] transition-colors text-[#3d2c28] dark:text-gray-300"
            >
              <span className="text-sm font-medium">
                {isSidebarCollapsed ? "→" : "←"}
              </span>
              {!isSidebarCollapsed && (
                <span className="ml-2 text-sm">Collapse</span>
              )}
            </button>

            {/* Dashboard Panel Info */}
            {/* {!isSidebarCollapsed && (
              <div className="mb-6 hidden md:block rounded-3xl bg-[#DBA39A] dark:bg-[#2d2d44] p-5 text-white shadow-lg">
                <h2 className="text-lg font-bold">Dashboard Panel</h2>
                <p className="mt-1 text-sm text-white/80 dark:text-gray-300">
                  Quickly manage your store activities and monitor performance.
                </p>
              </div>
            )} */}

            <div className="space-y-2">
              {sidebarLinks.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <Link
                    href={item.path}
                    key={item.name}
                    className={`group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-200 ${
                      isActive ?
                        "bg-[#DBA39A] dark:bg-[#2d2d44] text-white shadow-md"
                      : "text-[#3d2c28] dark:text-gray-300 hover:bg-white dark:hover:bg-[#2d2d44] hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                        isActive ?
                          "bg-white/20 dark:bg-white/10"
                        : "bg-[#F5EBEO] dark:bg-[#2d2d44] group-hover:bg-[#F0DBDB] dark:group-hover:bg-[#3d3d5c]"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${isActive ? "text-white" : "text-[#DBA39A]"}`}
                      />
                    </div>

                    {!isSidebarCollapsed && (
                      <div className="hidden md:block">
                        <p className="font-medium">{item.name}</p>
                        <p
                          className={`text-xs ${
                            isActive ?
                              "text-white/80 dark:text-gray-300"
                            : "text-[#3d2c28]/40 dark:text-gray-500"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="rounded-3xl bg-white/70 dark:bg-[#1a1a2e]/90 backdrop-blur-xl border border-[#F5EBEO] dark:border-[#2d2d44] p-4 md:p-6 shadow-sm min-h-[calc(100vh-120px)] transition-colors duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
