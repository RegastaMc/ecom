import React from 'react'
import { features } from '../assets/assets'
import bottomBanner from '../images/idea.jpg'
import bottomBannerSm from '../images/idea.jpg'

const BottomBanner = () => {
  return (
    <div className='relative mt-24 max-w-6xl mx-auto h-[350px] md:h-[400px] overflow-hidden rounded-xl'>

      <img 
        src={bottomBanner} 
        alt="banner"
        className='w-full h-full object-cover hidden md:block'
      />

      <img 
        src={bottomBannerSm} 
        alt="banner"
        className='w-full h-full object-cover md:hidden'
      />

      <div className='absolute inset-0 flex items-center justify-center md:justify-end md:pr-20 bg-black/40'>

        <div className='bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-lg shadow-lg max-w-md'>
               <h1 className='text-xl md:text-2xl font-semibold font-serif text-gray-800/90 mb-6 leading-relaxed md:leading-relaxed tracking-wide'>
               why chose us
             </h1>
          
          {features.map((feature, index) => (
            <div key={index} className='flex items-start gap-3 mb-3'>
              <img 
                src={feature.icon} 
                alt={feature.title} 
                className='w-8 md:w-10'
              />
              <div>
                <h3 className='text-base md:text-lg font-semibold'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 text-xs md:text-sm'>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  )
}

export default BottomBanner