import React from 'react'
import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'

const BestSeller = () => {
  const { products } = useAppContext();
  return (
    <div className='mt-16 flex justify-center'>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
                  mt-6 gap-6">
           {products.slice(0, 5).map((product, index) => (
        <ProductCard key={product._id || index} product={product} />
       ))}

        </div>
    </div>
  )
}

export default BestSeller