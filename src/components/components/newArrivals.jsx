import React from 'react'
import jumpsuitfive from "../images/jumpsuitfive.jpg";
import jumpsuitone from "../images/jumpsuitone.jpg";
import jumpsuittwo from "../images/jumpsuittwo.jpg";
import jumpsuitthree from "../images/jumpsuitthree.jpg";
import widelegone from "../images/widelegone.jpg";
import jumpsuitfour from "../images/jumpsuitfour.jpg";

const NewArrivals = () => {
        const products = [
        {
            id: 1,
            name: "Elegant Metal Buttons And Twist Detail Waist Jumpsuit, V-Neck, Long ",
            price: 1900,
            image: jumpsuitfive,
            objectPosition: "object-top"
        },
        {
            id: 2,
            name: "Mock Neck Mesh Patchwork Cinch Waist Cape Party Jumpsuit-White White-3XL",
            price: 1900,
            image: jumpsuitone,
            objectPosition: "object-right"
        },
        {
            id: 3,
            name: "Strapless Off Shoulder Bodycon Tube Top Overalls Jumpsuit Wide Leg Pants",
            price: 1900,
            image: jumpsuittwo,
            objectPosition: "object-right"
        },
        {
            id: 4,
            name: "Versatile Sleeveless Lapel Waist Chain Wide Leg Jumpsuit, Black For Women,:",
            price: 1900,
            image: jumpsuitthree,
            objectPosition: "object-right"
        },
        {
            id: 4,
            name: "Fall Solid Long Sleeved Cross V-Neck Slim Curve Elegant Long Sleeved Trousers Suit",
            price: 1900,
            image: widelegone,
            objectPosition: "object-right"
        },
        {
            id: 4,
            name: "Asymmetrical Patchwork Ruched Jumpsuit Casual Cinched Waist Zipper Back Straight Leg Jumpsuit",
            price: 1900,
            image: jumpsuitfour,
            objectPosition: "object-right"
        }
    ];
    return(
<>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
                .font-poppins {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>

            <h1 className="text-3xl font-medium text-slate-800 text-center mb-2 font-poppins">
                New Arrivals
            </h1>
            <p className="text-slate-600 mb-10 font-poppins text-center">
                Explore the latest additions to our collection.
            </p>

            <section className="flex flex-wrap items-center justify-center gap-6">
                {products.map((product) => (
                    <a key={product.id} href="#" className="group w-56">
                        <img
                            className={`rounded-lg w-full group-hover:shadow-xl hover:-translate-y-0.5 duration-300 transition-all h-72 object-cover ${product.objectPosition}`}
                            src={product.image}
                            alt={product.name}
                        />
                        <p className="text-sm mt-2">{product.name}</p>
                        <p className="text-xl"> ksh {product.price}</p>
                    </a>
                ))}
            </section>
        </>
    )
}

export default NewArrivals