

import photoone from "../images/photoone.jpg";
import phototwo from "../images/phototwo.jpg";
import photothree from "../images/photothree.jpg";
import photofour from "../images/photofour.jpg";
import photofive from "../images/photofive.jpg";

const Testimonials = () => {
        const testimonials = [
        {
            id: 1,
            name: "mercy pick",
            role: "cocktaildress",
            image: photoone,
            review: "The fabric feels luxurious and the fit is absolutely perfect. I received so many compliments — definitely my new favorite outfit!",
            rating: 5
        },
        {
            id: 2,
            name: "Sophia Bennett",
            role: "jumpsuit",
            image: phototwo,
            review: "Super comfortable and high quality material. It looks even better in person than in the pictures!",
            rating: 5
        },
        {
            id: 3,
            name: "Naomi Blake",
            role: "Formaldress",
            image: photothree,
            review: "The design is modern and flattering. It hugs the body beautifully without feeling uncomfortable",
            rating: 5
        },
                {
            id: 3,
            name: "Ava Thompson",
            role: "partydress",
            image: photofour,
            review: "I wore this to a party and it turned heads all night. Elegant, stylish, and worth every coin",
            rating: 5
        },
                {
            id: 3,
            name: "Emily Roberts",
            role: "silkdress",
            image: photofive,
            review: "Lightweight, breathable, and easy to style. Perfect for both casual and semi-formal occasions",
            rating: 5
        }
    ];

    return (
        <div className="text-center py-16">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                SEE WHAT OUR CUSTOMERS HAVE TO SAY
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-4">
                Our customers love the quality, style, and comfort of our outfits.
            </p>

            <div className="flex flex-wrap justify-center gap-5 mt-12">

                {testimonials.map((item) => (
                    <div
                        key={item.id}
                        className="w-80 flex flex-col items-start border border-gray-200 p-5 rounded-lg bg-white"
                    >

                        {/* Quote Icon */}
                        <svg width="44" height="40" viewBox="0 0 44 40" fill="none">
                            <path
                                d="M33.172 5.469q2.555 0 4.547 1.547..."
                                fill="#2563EB"
                            />
                        </svg>

                        {/* Rating Stars */}
                        <div className="flex items-center mt-3 gap-1">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="15"
                                    viewBox="0 0 16 15"
                                    fill="currentColor"
                                    className={`w-4 h-4 ${i < item.rating ? "text-orange-500" : "text-gray-300"}`}
                                >
                                    <path
                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.956c.3.922-.755 1.688-1.54 1.118l-3.368-2.447a1 1 0 00-1.176 0l-3.368 2.447c-.784.57-1.838-.196-1.539-1.118l1.287-3.956a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.299-3.957z"
                                        fill="#ffd22eff"
                                    />
                                </svg>
                            ))}
                        </div>

                        {/* Review */}
                        <p className="text-sm mt-3 text-gray-500">
                            {item.review}
                        </p>

                        {/* User Info */}
                        <div className="flex items-center gap-3 mt-4">
                            <img
                                className="h-12 w-12 rounded-full object-cover"
                                src={item.image}
                                alt={item.name}
                            />
                            <div>
                                <h2 className="text-lg text-gray-900 font-medium">
                                    {item.name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {item.role}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default Testimonials