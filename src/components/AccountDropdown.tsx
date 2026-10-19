import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../prisma/src/lib/prisma/client';



interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  divider: boolean;
}

interface AccountDropdownProps {
  user?: User | null;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onSignOut?: () => void;
  className?: string;
}


const Icons = {
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  SignIn: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  SignUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  Orders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
 
  Addresses: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  Products: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Customers: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Inventory: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  Reports: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Coupons: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  SignOut: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Help: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const AccountDropdown: React.FC<AccountDropdownProps> = ({
  user,
  onSignIn,
  onSignUp,
  onSignOut,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Handle hover
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (isHovering) {
        setIsOpen(true);
      }
    }, 150);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setIsOpen(false);
      }
    }, 200);
  };

  // Toggle dropdown on click
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Get user initials for avatar
  // const getUserInitials = (): string => {
  //   if (!user) return '?';
  //   return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  // };

  // Get user display name
  // const getUserDisplayName = (): string => {
  //   if (!user) return 'Account';
  //   return `${user.firstName} ${user.lastName}`;
  // };

  // Check if user has admin or staff role
  const isAdmin = user?.role === 'ADMIN' 

  // Build menu items based on authentication status
  const getMenuItems = (): MenuItem[] => {
    if (!user) {
      return [
        {
          label: 'Sign In',
          icon: <Icons.SignIn />,
          onClick: onSignIn,
          divider: false,
        },
        {
          label: 'Sign Up',
          icon: <Icons.SignUp />,
          onClick: onSignUp,
          divider: false,
        },
      ];
    }

    const items: MenuItem[] = [
      // {
      //   label: 'My Account',
      //   icon: <Icons.User />,
      //   href: '/my-account',
      //   divider: false,
      // },
      {
        label: 'My Orders',
        icon: <Icons.Orders />,
        href: '/my-orders',
        divider: false,
      },
    
      // {
      //   label: 'My Addresses',
      //   icon: <Icons.Addresses />,
      //   href: '/addresses',
      //   divider: false,
      // },
      // {
      //   label: 'Settings',
      //   icon: <Icons.Settings />,
      //   href: '/settings',
      //   divider: false,
      // },
    ];

    // Add admin/staff items
    if (isAdmin) {
      items.push(
        {
          label: 'Dashboard',
          icon: <Icons.Dashboard />,
          href: `/admin/dashboard/${user.id}/overview`,
          divider: true,
        },
        // {
        //   label: 'Products',
        //   icon: <Icons.Products />,
        //   href: '/admin/products',
        //   divider: false,
        // },
        // {
        //   label: 'Orders',
        //   icon: <Icons.Orders />,
        //   href: '/admin/orders',
        //   divider: false,
        // },
        // {
        //   label: 'Customers',
        //   icon: <Icons.Customers />,
        //   href: '/admin/customers',
        //   divider: false,
        // },
        // {
        //   label: 'Inventory',
        //   icon: <Icons.Inventory />,
        //   href: '/admin/inventory',
        //   divider: false,
        // },
        // {
        //   label: 'Reports',
        //   icon: <Icons.Reports />,
        //   href: '/admin/reports',
        //   divider: false,
        // },
       
        // {
        //   label: 'Site Settings',
        //   icon: <Icons.Settings />,
        //   href: '/admin/settings',
        //   divider: false,
        // }
      );
    }

    // Add sign out at the end
    items.push({
      label: 'Sign Out',
      icon: <Icons.SignOut />,
      onClick: onSignOut,
      divider: true,
    });

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <div
        ref={triggerRef}
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F5EBEO] transition-colors cursor-pointer group relative"
        aria-label="Account menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar or Icon */}
        {typeof user?.image === 'string' ? (
          <img
            src={user.image}
            alt={user.name || 'User Avatar'}
            className="w-8 h-8 rounded-full object-cover border-2 border-[#DBA39A]/20"
          />
        ) : user ? (
          <div className="w-8 h-8 rounded-full bg-[#DBA39A] flex items-center justify-center text-white font-semibold text-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#DBA39A]"
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
        )}

        {/* Label */}
        <span className="hidden lg:inline text-sm font-medium text-[#3d2c28]">
          {user ? user.name || 'User' : 'Account'}
        </span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-[#3d2c28]/40 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>

        {/* Online status indicator */}
        {user && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#F5EBEO] py-2 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User Info Header (when authenticated) */}
          {user && (
            <div className="px-4 py-3 border-b border-[#F5EBEO]">
              <div className="flex items-center gap-3">
                {typeof user.image === 'string' ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-10 h-10 rounded-full cursor-pointer object-cover border-2 border-[#DBA39A]/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#DBA39A] cursor-pointer flex items-center justify-center text-white font-semibold text-sm">
                    { user.name || 'U' }
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#3d2c28] text-sm truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-[#3d2c28]/60 truncate">{user.email}</p>
                  {isAdmin && (
                    <span className="text-xs bg-[#DBA39A]/10 text-[#DBA39A] px-2 py-0.5 rounded-full font-medium">
                      {user.role === 'ADMIN' ? 'ADMIN' : 'Staff'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                {item.divider && index > 0 && (
                  <div className="border-t border-[#F5EBEO] my-1" />
                )}
                {item.onClick ? (
                  <button
                    onClick={() => {
                      item.onClick?.();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center cursor-pointer gap-3 px-4 py-2.5 text-sm text-[#3d2c28] hover:bg-[#F5EBEO] hover:pl-6 transition-all duration-200 group"
                    role="menuitem"
                  >
                    <span className="text-[#DBA39A] group-hover:text-[#c49087] transition-colors">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ) : (
                  <a
                    href={item.href}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#3d2c28] hover:bg-[#F5EBEO] hover:pl-6 transition-all duration-200 group"
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-[#DBA39A] group-hover:text-[#c49087] transition-colors">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {item.href?.startsWith('/admin') && (
                      <span className="ml-auto text-xs bg-[#DBA39A]/10 text-[#DBA39A] px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </a>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Footer - Quick actions */}
          {/* {user && (
            <div className="border-t border-[#F5EBEO] px-4 py-2 mt-1">
              <div className="flex items-center justify-between text-xs text-[#3d2c28]/40">
                <span>Logged in</span>
                <button
                  onClick={() => {
                    console.log('Help clicked');
                    setIsOpen(false);
                  }}
                  className="text-[#DBA39A] hover:underline flex items-center gap-1"
                >
                  <Icons.Help />
                  Help
                </button>
              </div>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;