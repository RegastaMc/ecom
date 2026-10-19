import React from "react";
import { useAppContext } from "../context/AppContext";

import cockTail from "../images/cocktaildress.jpg";
import lacedress from "../images/lacedress.jpg";
import silkdress from "../images/silkddress.jpg";
import partydress from "../images/partydress.jpg";
import Tealengthdress from "../images/Tealengthdress.jpg";
import formaldress from "../images/formaldress.jpg";
import eveningwear from "../images/eveningwear.jpg";
import ankaradress from "../images/ankaradress.png";
import jumpsuit from "../images/jumpsuit.png";

const categories = [
  {
    text: "Cocktail Dress",
    path: "cocktaildresses",
    image: cockTail,
    description: "Elegant and stylish dress perfect for parties and events",
  },
  {
    text: "Laced Dress",
    path: "laceddress",
    image: lacedress,
    description: "Delicate lace detailing for a classy and feminine look",
  },
  {
    text: "Silk Dress",
    path: "silkdress",
    image: silkdress,
    description: "Smooth and luxurious silk fabric for a premium feel",
  },
  {
    text: "Party Dress",
    path: "partydress",
    image: partydress,
    description: "Fun and vibrant dress ideal for celebrations",
  },
  {
    text: "Formal Dress",
    path: "formaldress",
    image: formaldress,
    description: "Sophisticated dress for formal occasions",
  },
  {
    text: "Tea Length Dress",
    path: "tealengthdress",
    image: Tealengthdress,
    description: "Classic tea-length dress perfect for semi-formal events",
  },
  {
    text: "Evening Wear",
    path: "eveningwear",
    image: eveningwear,
    description: "Chic and glamorous evening outfits",
  },
  {
    text: "Ankara Dress",
    path: "ankaradress",
    image: ankaradress,
    description: "Traditional African print dress with vibrant colors",
  },
  {
    text: "Jumpsuit",
    path: "jumpsuit",
    image: jumpsuit,
    description: "Modern one-piece outfit for stylish comfort",
  },
];

const Categories = () => {
  const { navigate } = useAppContext();

  return (
    <div className="mt-16 px-4 md:px-10">
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-semibold text-center text-black">
        Our collection
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-8 mt-8">
        {categories.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/products/${item.path}`);
              window.scrollTo(0, 0);
            }}
            className="cursor-pointer group"
          >
            {/* Image */}
            <div className="overflow-hidden rounded-xl shadow-md">
              <img
                src={item.image}
                alt={item.text}
                className="w-full h-74 object-cover group-hover:scale-105 transition duration-300"
              />
            </div>

            {/* Text Below Image */}
            <div className="mt-3 text-center">
              <p className="font-semibold text-base">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;