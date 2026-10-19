import { getProductById } from '@/app/actions/getProducts'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import ProductDetailsClient from '@/components/components/Ui/ProductsDetailsClient'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { id } = await params
  const { success, product } = await getProductById(id)

  if (!success || !product) {
    notFound()
  }

  // Get related products from same category

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Product Details */}
      <ProductDetailsClient product={product} />

      {/* Related Products Section */}
      {/* {relatedProducts.length > 0 && (
        <div className='mt-16'>
          <div className='border-t pt-8'>
            <h2 className='text-2xl font-bold mb-6'>Related Products</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}

export default ProductPage
