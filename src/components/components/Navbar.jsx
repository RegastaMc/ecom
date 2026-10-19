import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import logo from "../images/logo.jpg";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    user, 
    setUser, 
    setShowUserLogin, 
    searchQuery, 
    setSearchQuery ,
    getCartCount,
    axios

  } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get('/api/user/logout')
      if(data.success){
        toast.success(data.message)
        setUser(null);
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      navigate("/products");
    }
  }, [searchQuery]);

  return (
      <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
        {/* Logo */}
        <NavLink to="/" onClick={() => setOpen(false)}>
        <img src={logo} alt="logo" className="h-16 object-contain"/>
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">All Products</NavLink>
          <NavLink to="/contact">Contact</NavLink>

          {/* Search bar */}
          <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
              type="text"
              placeholder="Search products"
            />
            <img src={assets.search_icon} alt="search" className="w-4 h-4" />
          </div>

          {/* Cart */}
          <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
            <img src={assets.nav_cart_icon} alt="cart" className="w-6 opacity-80" />
            <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">
              {getCartCount()}
            </button>
          </div>

          {/* User dropdown (desktop) */}
          {!user ? (
            <button
              onClick={() => setShowUserLogin(true)}
              className="px-8 py-2 bg-primary text-white rounded-full"
            >
              Login
            </button>
          ) : (
            <div className="relative group">
              <img src={assets.profile_icon} className="w-10 cursor-pointer" alt="" />
              <ul className="hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-50">
                <li
                  onClick={() => navigate("my-orders")}
                  className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                >
                  My order
                </li>
                <li
                  onClick={logout}
                  className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className='flex items-center gap-6 sm:hidden'>
          <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
            <img src={assets.nav_cart_icon} alt="cart" className="w-6 opacity-80" />
            <button 
            onClick={() => setOpen(false)}
            className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">
              {getCartCount()}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="sm:hidden flex items-center"
          onClick={() => setOpen(!open)}
        >
          <img src={assets.menu_icon} alt="menu" className="w-7" />
        </button>

        {/* Mobile Menu */}
        {open && (
          <div className="sm:hidden absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex flex-col items-start gap-2 px-5 text-sm z-50">
            <NavLink to="/" onClick={() => setOpen(false)} className="cursor-pointer">Home</NavLink>
            <NavLink to="/products" onClick={() => setOpen(false)} className="cursor-pointer">All Products</NavLink>
            <NavLink to="/my-orders" onClick={() => setOpen(false)}className="cursor-pointer">My Orders</NavLink>
            <NavLink to="/contact" onClick={() => setOpen(false)}className="cursor-pointer">Contact</NavLink>

            {!user ? (
              <button
                onClick={() => {
                  setShowUserLogin(true); 
                  setOpen(false)}
                }
                className="px-8 py-2 bg-primary text-white rounded-full mt-2 cursor-pointer"
                style={{ WebkitTapHighlightColor: "transparent" }}
              > 
                Login
              </button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => {
                    navigate("my-orders");
                    setOpen(false);
                  }}
                  className="p-2 hover:bg-primary/10 text-left cursor-pointer"
                  style={{ WebkitTapHighlightColor: "transparent" }} // double safety
                >
                  My Orders
                </button>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="p-2 hover:bg-primary/10 text-left cursor-pointer"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

  );
};

export default Navbar;
