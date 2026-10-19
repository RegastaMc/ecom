import React from 'react'

const NewsLetter = () => {
    
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-2 mt-24 pb-14">
            <h1 className="md:text-4xl text-2xl font-semibold">Join our newsletter for early access and a special surprise! 😉</h1>
            <p className="md:text-lg text-2xl font-semibold">
                All our stylish little secrets.. Directly to your inbox🤫
            </p>
            <form className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12">
                <input
                    className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
                    type="text"
                    placeholder="Enter your email id"
                    required
                />
                <button type="submit" className="md:px-12 px-8 h-full text-white bg-primary hover:bg-indigo-600 transition-all cursor-pointer rounded-md rounded-l-none">
                    Subscribe
                </button>
            </form>
            <h3 className='text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-center text-gray-900/90
             md:text-left max-w-72 md:max-w-100 lg:max-w-305 leading-snug lg:leading-tight tracking-wide'>
               Kenya's Top Fashion brand
                </h3>

               <h1 className='text-xl md:text-2xl font-semibold font-serif text-gray-800/90 mb-6 leading-relaxed md:leading-relaxed tracking-wide'>
                 We are a 100% Made In Kenya Women's Wear brand<br />
                 that provides contemporary apparel<br />
                  that will have you feeling beautiful and confident<br />
                 to live your best life!
                </h1>
        </div>
    )
}

export default NewsLetter