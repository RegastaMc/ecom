import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
  const { currency, addToCart, removeFromCart, cartItems, navigate } = useAppContext();

  if (!product) return null;

  const imageUrl = product?.images?.[0] || assets.placeholder; // fallback image

  return (
    <div
      onClick={() => {
        navigate(`/products/${product.category?.toLowerCase()}/${product._id}`);
        scrollTo(0, 0);
      }}
      className="border border-gray-300 rounded-xl bg-white shadow-sm hover:shadow-md transition 
                 flex flex-col justify-between p-4 cursor-pointer w-full max-w-[250px] mx-auto"
    >
      {/* Image */}
      <div className="flex items-center justify-center mb-3 overflow-hidden rounded-lg h-40 bg-gray-50">
        <img
          className="object-contain h-full w-full transition-transform duration-200 group-hover:scale-105"
          src={imageUrl}
          alt={product.name}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-grow justify-between text-gray-600">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">{product.category}</p>
          <p className="text-gray-800 font-semibold text-base truncate">{product.name}</p>

          <div className="flex items-center gap-1 mt-1">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <img
                  key={i}
                  className="w-3.5 h-3.5"
                  src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                  alt="star"
                />
              ))}
            <p className="text-xs text-gray-500">(4)</p>
          </div>
        </div>

        {/* Price + Cart */}
        <div className="flex items-end justify-between mt-3">
          <p className="text-lg font-semibold text-indigo-600">
            {currency}{product.offerPrice}{" "}
            <span className="text-gray-400 text-sm line-through ml-1">
              {currency}{product.price}
            </span>
          </p>

          <div
            onClick={(e) => e.stopPropagation()}
            className="text-indigo-500"
          >
            {!cartItems[product._id] ? (
              <button
                className="flex items-center justify-center gap-1 bg-indigo-100 hover:bg-indigo-200
                           w-[80px] h-[34px] rounded-md text-indigo-700 font-medium transition"
                onClick={() => addToCart(product._id)}
              >
                <img src={assets.cart_icon} alt="cart_icon" className="w-4" />
                Add
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 w-[80px] h-[34px] bg-indigo-500/20 rounded-md">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="cursor-pointer px-2 text-lg font-bold text-indigo-700"
                >
                  -
                </button>
                <span className="w-5 text-center text-indigo-800 font-medium">
                  {cartItems[product._id]}
                </span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="cursor-pointer px-2 text-lg font-bold text-indigo-700"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
