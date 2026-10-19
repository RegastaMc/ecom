'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { 
  Package, 
  Upload, 
  X, 
  Save,
  ChevronDown,
  Image as ImageIcon,
  DollarSign,
  Percent,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { updateProduct } from '@/app/actions/prod';
import { mockCategories } from '@/components/CategoriesSection';

type SubCategory = {
  id: string;
  name: string;
  slug: string;
};

interface EditProductPageProps {
  product: {
    id: string;
    name: string;
    desc: string | null;
    category: string;
    subCategory?: string | null;
    price: number;
    offerPrice: number | null;
    isAvailable: boolean;
    images: string[];
  };
}

type FormValues = {
  name: string;
  desc: string;
  category: string;
  subCategory: string;
  price: string;
  offerPrice: string;
  isAvailable: boolean;
  images: string[];
};

export default function EditProductPage({ product }: EditProductPageProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(product.images || []);
  const [submitting, setSubmitting] = useState(false);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      name: product.name,
      desc: product.desc || '',
      category: product.category,
      subCategory: product.subCategory || '',
      price: product.price.toString(),
      offerPrice: product.offerPrice?.toString() || '',
      isAvailable: product.isAvailable,
      images: product.images || [],
    },
  });

  const isAvailable = watch('isAvailable');
  const categoryValue = watch('category');

  // Update subcategories when category changes
  useEffect(() => {
    if (categoryValue) {
      const category = mockCategories.find(c => c.name === categoryValue);
      setSubCategories(category?.subCategories || []);
      // If the current subcategory is not in the new list, reset it
      const currentSubCategory = watch('subCategory');
      if (currentSubCategory && !category?.subCategories?.find(s => s.name === currentSubCategory)) {
        setValue('subCategory', '');
      }
    } else {
      setSubCategories([]);
      setValue('subCategory', '');
    }
  }, [categoryValue, setValue, watch]);

  // Reset form when product changes
  useEffect(() => {
    reset({
      name: product.name,
      desc: product.desc || '',
      category: product.category,
      subCategory: product.subCategory || '',
      price: product.price.toString(),
      offerPrice: product.offerPrice?.toString() || '',
      isAvailable: product.isAvailable,
      images: product.images || [],
    });
    setImageUrls(product.images || []);
    // Set initial subcategories
    if (product.category) {
      const category = mockCategories.find(c => c.name === product.category);
      setSubCategories(category?.subCategories || []);
    }
  }, [product, reset]);

  const handleImageUpload = async (e: any) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file as Blob | string);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImageUrls = [...imageUrls, ...uploadedUrls];
      setImageUrls(newImageUrls);
      setValue('images', newImageUrls);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const imageToRemove = imageUrls[indexToRemove];

    if (!imageToRemove) return;

    // Track deleted images for server-side cleanup
    setDeletedImages((prev) => [...prev, imageToRemove]);

    const getPublicIdFromUrl = (url: string) => {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;

      const pathParts = parts[1].split('/');
      const versionIndex = pathParts.findIndex((part) => part.startsWith('v'));
      const startIndex = versionIndex !== -1 ? versionIndex + 1 : 0;

      const publicIdWithExtension = pathParts.slice(startIndex).join('/');
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
      return publicId;
    };

    const publicId = getPublicIdFromUrl(imageToRemove);

    if (publicId) {
      try {
        const response = await fetch('/api/upload', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicId }),
        });

        const result = await response.json();
        if (result.data?.success || result.success) {
          const newImageUrls = imageUrls.filter(
            (_, index) => index !== indexToRemove,
          );
          setImageUrls(newImageUrls);
          setValue('images', newImageUrls);
          toast.success('Image deleted successfully');
        } else {
          console.error('Failed to delete from Cloudinary');
          const newImageUrls = imageUrls.filter(
            (_, index) => index !== indexToRemove,
          );
          setImageUrls(newImageUrls);
          setValue('images', newImageUrls);
          toast.warning('Image removed from form but may still exist on server');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        const newImageUrls = imageUrls.filter(
          (_, index) => index !== indexToRemove,
        );
        setImageUrls(newImageUrls);
        setValue('images', newImageUrls);
        toast.warning('Image removed from form but may still exist on server');
      }
    } else {
      const newImageUrls = imageUrls.filter(
        (_, index) => index !== indexToRemove,
      );
      setImageUrls(newImageUrls);
      setValue('images', newImageUrls);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);

    try {
      const productData = {
        id: product.id,
        name: data.name,
        desc: data.desc || null,
        category: data.category,
        subCategory: data.subCategory || null,
        price: parseFloat(data.price),
        offerPrice: data.offerPrice ? parseFloat(data.offerPrice) : null,
        isAvailable: data.isAvailable,
        images: imageUrls,
        deletedImages: deletedImages,
      };

      const res = await updateProduct(productData);
      if (!res.success) {
        throw new Error(res.error || 'Product update failed');
      }
      toast.success('Product updated successfully!');
      router.refresh();
      router.push('/admin/dashboard/id/products');
    } catch (error) {
      console.error('Product update failed:', error);
      toast.error('Failed to update product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFCF3] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#3d2c28]">Edit Product</h1>
          <p className="text-sm text-[#3d2c28]/60">Update product information</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-[#F5EBEO] overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-4 bg-[#DBA39A]/10 border-b border-[#F5EBEO]">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-[#DBA39A]" />
              <h2 className="text-lg font-semibold text-[#3d2c28]">Product Details</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name', { required: 'Product name is required' })}
                className={`w-full px-4 py-2.5 border ${
                  errors.name ? 'border-red-300 focus:ring-red-200' : 'border-[#F5EBEO] focus:ring-[#DBA39A]/20'
                } rounded-xl focus:outline-none focus:ring-2 focus:border-[#DBA39A] transition-colors text-[#3d2c28] placeholder:text-[#b8a69c]`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                Description
              </label>
              <textarea
                {...register('desc')}
                rows={4}
                className="w-full px-4 py-2.5 border border-[#F5EBEO] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] transition-colors text-[#3d2c28] placeholder:text-[#b8a69c] resize-none"
                placeholder="Enter product description"
              />
            </div>

            {/* Category and SubCategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className={`w-full px-4 py-2.5 border ${
                      errors.category ? 'border-red-300 focus:ring-red-200' : 'border-[#F5EBEO] focus:ring-[#DBA39A]/20'
                    } rounded-xl focus:outline-none focus:ring-2 focus:border-[#DBA39A] transition-colors text-[#3d2c28] appearance-none`}
                  >
                    <option value="">Select a category</option>
                    {mockCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3d2c28]/40 pointer-events-none" />
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* SubCategory */}
              <div>
                <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                  Sub Category
                </label>
                <div className="relative">
                  <select
                    {...register('subCategory')}
                    disabled={!categoryValue || subCategories.length === 0}
                    className={`w-full px-4 py-2.5 border border-[#F5EBEO] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] transition-colors text-[#3d2c28] appearance-none ${
                      (!categoryValue || subCategories.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">Select a sub category</option>
                    {subCategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3d2c28]/40 pointer-events-none" />
                </div>
                {(!categoryValue || subCategories.length === 0) && (
                  <p className="mt-1 text-xs text-[#3d2c28]/40">
                    {!categoryValue ? 'Select a category first' : 'No sub categories available'}
                  </p>
                )}
              </div>
            </div>

            {/* Price and Offer Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                  Price (Ksh.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b8a69c]" /> */}
                  <input
                    type="number"
                    step="0.01"
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 0, message: 'Price must be positive' },
                    })}
                    className={`w-full pl-9 pr-4 py-2.5 border ${
                      errors.price ? 'border-red-300 focus:ring-red-200' : 'border-[#F5EBEO] focus:ring-[#DBA39A]/20'
                    } rounded-xl focus:outline-none focus:ring-2 focus:border-[#DBA39A] transition-colors text-[#3d2c28] placeholder:text-[#b8a69c]`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                  Offer Price (Ksh.)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b8a69c]" />
                  <input
                    type="number"
                    step="0.01"
                    {...register('offerPrice', {
                      min: { value: 0, message: 'Offer price must be positive' },
                    })}
                    className={`w-full pl-9 pr-4 py-2.5 border ${
                      errors.offerPrice ? 'border-red-300 focus:ring-red-200' : 'border-[#F5EBEO] focus:ring-[#DBA39A]/20'
                    } rounded-xl focus:outline-none focus:ring-2 focus:border-[#DBA39A] transition-colors text-[#3d2c28] placeholder:text-[#b8a69c]`}
                    placeholder="0.00"
                  />
                </div>
                {errors.offerPrice && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.offerPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#F5EBEO]/30 rounded-xl border border-[#F5EBEO]">
              <div>
                <h3 className="text-sm font-medium text-[#3d2c28]">Product Availability</h3>
                <p className="text-xs text-[#3d2c28]/60">
                  Toggle to control if product is visible to customers
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isAvailable')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DBA39A]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DBA39A]"></div>
                <span className="ml-3 text-sm font-medium text-[#3d2c28]">
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#3d2c28] mb-1.5">
                Product Images
              </label>

              {/* Image Preview Grid */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square relative rounded-xl overflow-hidden border border-[#F5EBEO]">
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-[#F5EBEO] rounded-xl hover:border-[#DBA39A]/50 transition-colors">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-[#b8a69c]" />
                  <div className="flex text-sm text-[#3d2c28]/60">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#DBA39A] hover:text-[#c49087] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#DBA39A]"
                    >
                      <span>Upload new images</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-[#b8a69c]">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-[#3d2c28]/60">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#DBA39A] border-t-transparent"></div>
                  <span className="text-sm">Uploading images...</span>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t border-[#F5EBEO]">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2.5 border-2 border-[#F5EBEO] rounded-xl text-[#3d2c28] hover:border-[#DBA39A]/40 hover:bg-[#F5EBEO]/30 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 bg-[#DBA39A] hover:bg-[#c49087] text-white px-4 py-2.5 rounded-xl transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Update Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}