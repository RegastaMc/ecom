'use client'
import { auth } from '@/lib/auth'
import { ShippingFormInputs, shippingFormSchema } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'

const ShippingForm = ({
  setShippingForm,
}: {
  setShippingForm: (data: ShippingFormInputs) => void
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormInputs>({
    resolver: zodResolver(shippingFormSchema),
  })

  const router = useRouter()

  const { data: session } = useSession()

  let email = session?.user?.email 

  const handleShippingForm: SubmitHandler<ShippingFormInputs> = (data) => {
    setShippingForm(data)
    router.push('/cart?step=3', { scroll: false })
  }

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={handleSubmit(handleShippingForm)}
    >
      <div className='flex flex-col gap-1'>
        <label htmlFor='name' className='text-xs text-gray-500 font-medium'>
          Name
        </label>
        <input
          className='border-b border-gray-200 py-2 outline-none text-sm placeholder:text-gray-200'
          type='text'
          id='name'
          placeholder='i.e John Doe'
          {...register('name')}
        />
        {errors.name && (
          <p className='text-xs text-red-500'>{errors.name.message}</p>
        )}
      </div>
      <div className='flex flex-col gap-1'>
        <label htmlFor='email' className='text-xs text-gray-500 font-medium'>
          Email
        </label>
        <input
          className='border-b border-gray-200 py-2 outline-none text-sm placeholder:text-gray-200'
          type='email'
          id='email'
          placeholder='i.e example@gmail.com'
          {...register('email')}
          value={email}
        />
        {errors.email && (
          <p className='text-xs text-red-500'>{errors.email.message}</p>
        )}
      </div>
      <div className='flex flex-col gap-1'>
        <label htmlFor='phone' className='text-xs text-gray-500 font-medium'>
          Phone
        </label>
        <input
          className='border-b border-gray-200 py-2 outline-none text-sm placeholder:text-gray-200'
          type='text'
          id='phone'
          placeholder='i.e 0712345678'
          {...register('phone')}
        />
        {errors.phone && (
          <p className='text-xs text-red-500'>{errors.phone.message}</p>
        )}
      </div>
      <div className='flex flex-col gap-1'>
        <label htmlFor='address' className='text-xs text-gray-500 font-medium'>
          Address
        </label>
        <input
          className='border-b border-gray-200 py-2 outline-none text-sm placeholder:text-gray-200'
          type='text'
          id='address'
          placeholder='i.e Ruiru,Kiambu'
          {...register('address')}
        />
        {errors.address && (
          <p className='text-xs text-red-500'>{errors.address.message}</p>
        )}
      </div>
      <div className='flex flex-col gap-1'>
        <label htmlFor='city' className='text-xs text-gray-500 font-medium'>
          City
        </label>
        <input
          className='border-b border-gray-200 py-2 outline-none text-sm placeholder:text-gray-200'
          type='text'
          id='city'
          placeholder='i.e Thika'
          {...register('city')}
        />
        {errors.city && (
          <p className='text-xs text-red-500'>{errors.city.message}</p>
        )}
      </div>
      <button
        type='submit'
        className='w-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center gap-2'
      >
        Continue
        <ArrowRight className='w-3 h-3' />
      </button>
    </form>
  )
}

export default ShippingForm
