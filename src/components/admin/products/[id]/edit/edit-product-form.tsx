"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Package, Save, ChevronDown, Percent, AlertCircle } from "lucide-react";
import { updateProduct } from "@/app/actions/product";
import { ImageUploaderMulti } from "@/components/admin/image-uploader-multi";
import type { CategoryWithSubs } from "@/lib/queries/categories";

type Product = {
  id: string;
  name: string;
  desc: string;
  categoryId: string;
  subCategoryId: string;
  price: number;
  offerPrice: number | null;
  isAvailable: boolean;
  images: string[];
};

type FormValues = {
  name: string;
  desc: string;
  categoryId: string;
  subCategoryId: string;
  price: string;
  offerPrice: string;
  isAvailable: boolean;
};

export default function EditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: CategoryWithSubs[];
}) {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>(product.images);
  const [submitting, setSubmitting] = useState(false);
  const [subCategories, setSubCategories] = useState<
    { id: string; name: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: product.name,
      desc: product.desc,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      price: String(product.price),
      offerPrice: product.offerPrice != null ? String(product.offerPrice) : "",
      isAvailable: product.isAvailable,
    },
  });

  const isAvailable = watch("isAvailable");
  const categoryId = watch("categoryId");

  useEffect(() => {
    const cat = categories.find((c) => c.id === categoryId);
    setSubCategories(cat?.subCategories ?? []);
  }, [categoryId, categories]);

  async function onSubmit(data: FormValues) {
    if (imageUrls.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updateProduct(product.id, {
        ...data,
        price: parseFloat(data.price),
        offerPrice: data.offerPrice ? parseFloat(data.offerPrice) : null,
        images: imageUrls,
        subCategoryId: data.subCategoryId || null,
      });
      if (!res.success) throw new Error(res.error);
      toast.success("Product updated successfully");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FEFCF3] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#3d2c28]">Edit Product</h1>
          <p className="text-sm text-[#3d2c28]/60">
            Update product details for &quot;{product.name}&quot;.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#F5EBE0] bg-white shadow-lg">
          <div className="border-b border-[#F5EBE0] bg-[#DBA39A]/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-[#DBA39A]" />
              <h2 className="text-lg font-semibold text-[#3d2c28]">
                Product Details
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("name", { required: "Product name is required" })}
                className={`w-full rounded-xl border px-4 py-2.5 text-[#3d2c28] placeholder:text-[#b8a69c] focus:outline-none focus:ring-2 transition ${
                  errors.name ?
                    "border-red-300 focus:ring-red-200"
                  : "border-[#F5EBE0] focus:border-[#DBA39A] focus:ring-[#DBA39A]/20"
                }`}
              />
              {errors.name && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="size-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                Description
              </label>
              <textarea
                {...register("desc")}
                rows={4}
                className="w-full resize-none rounded-xl border border-[#F5EBE0] px-4 py-2.5 text-[#3d2c28] placeholder:text-[#b8a69c] focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 transition"
              />
            </div>

            {/* Category / Subcategory */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    {...register("categoryId", {
                      required: "Category is required",
                    })}
                    className={`w-full appearance-none rounded-xl border px-4 py-2.5 text-[#3d2c28] focus:outline-none focus:ring-2 transition ${
                      errors.categoryId ?
                        "border-red-300 focus:ring-red-200"
                      : "border-[#F5EBE0] focus:border-[#DBA39A] focus:ring-[#DBA39A]/20"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#3d2c28]/40" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                  Sub Category
                </label>
                <div className="relative">
                  <select
                    {...register("subCategoryId")}
                    disabled={!categoryId || subCategories.length === 0}
                    className={`w-full appearance-none rounded-xl border border-[#F5EBE0] px-4 py-2.5 text-[#3d2c28] focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 transition ${
                      !categoryId || subCategories.length === 0 ?
                        "cursor-not-allowed opacity-50"
                      : ""
                    }`}
                  >
                    <option value="">Select a sub category</option>
                    {subCategories.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#3d2c28]/40" />
                </div>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                  Price (Ksh.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Must be positive" },
                  })}
                  className={`w-full rounded-xl border px-4 py-2.5 text-[#3d2c28] focus:outline-none focus:ring-2 transition ${
                    errors.price ?
                      "border-red-300 focus:ring-red-200"
                    : "border-[#F5EBE0] focus:border-[#DBA39A] focus:ring-[#DBA39A]/20"
                  }`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                  Offer Price (Ksh.)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#b8a69c]" />
                  <input
                    type="number"
                    step="0.01"
                    {...register("offerPrice", {
                      min: { value: 0, message: "Must be positive" },
                    })}
                    className="w-full rounded-xl border border-[#F5EBE0] py-2.5 pl-9 pr-4 text-[#3d2c28] focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 transition"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between rounded-xl border border-[#F5EBE0] bg-[#F5EBE0]/30 p-4">
              <div>
                <h3 className="text-sm font-medium text-[#3d2c28]">
                  Product Availability
                </h3>
                <p className="text-xs text-[#3d2c28]/60">
                  Toggle to control visibility
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  {...register("isAvailable")}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#DBA39A] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DBA39A]/20" />
                <span className="ml-3 text-sm font-medium text-[#3d2c28]">
                  {isAvailable ? "Available" : "Unavailable"}
                </span>
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                Product Images <span className="text-red-500">*</span>
              </label>
              <ImageUploaderMulti value={imageUrls} onChange={setImageUrls} />
            </div>

            {/* Actions */}
            <div className="flex gap-4 border-t border-[#F5EBE0] pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-xl border-2 border-[#F5EBE0] px-4 py-2.5 font-medium text-[#3d2c28] transition hover:border-[#DBA39A]/40 hover:bg-[#F5EBE0]/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#DBA39A] px-4 py-2.5 font-medium text-white shadow-md transition hover:bg-[#c49087] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ?
                  <>
                    <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving…</span>
                  </>
                : <>
                    <Save className="size-4" />
                    <span>Save Changes</span>
                  </>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
