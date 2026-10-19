"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FolderTree,
  Plus,
  ChevronDown,
  AlertCircle,
  Tag,
  Sparkles,
} from "lucide-react";
import { createCategory } from "@/lib/actions/category.actions";
import { ImageUploaderMulti } from "@/components/admin/image-uploader-multi";

type FormValues = {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  sortOrder: string;
  isActive: boolean;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewCategoryForm({
  parents,
}: {
  parents: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [image, setImage] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: "",
      sortOrder: "0",
      isActive: true,
    },
  });

  const name = watch("name");
  const isActive = watch("isActive");

  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(name));
  }, [name, slugTouched, setValue]);

  async function onSubmit(data: FormValues) {
    if (image.length === 0) {
      toast.error("Please upload a cover image");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("description", data.description);
      formData.append("image", image[0]);
      formData.append("parentId", data.parentId);
      formData.append("sortOrder", data.sortOrder);
      if (data.isActive) formData.append("isActive", "true");

      const result = await createCategory(formData);
      if (!result.ok) {
        const firstError = Object.values(result.errors)[0]?.[0];
        throw new Error(firstError ?? "Failed to create");
      }
      toast.success("Category created successfully");
      router.push("/admin/dashboard/id/categories");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FEFCF3] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#3d2c28]">
            Create New Category
          </h1>
          <p className="text-sm text-[#3d2c28]/60">
            Organize your products into categories and subcategories.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#F5EBE0] bg-white shadow-lg">
          <div className="border-b border-[#F5EBE0] bg-[#DBA39A]/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <FolderTree className="size-5 text-[#DBA39A]" />
              <h2 className="text-lg font-semibold text-[#3d2c28]">
                Category Details
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* LEFT */}
              <div className="space-y-5 lg:col-span-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "Category name is required",
                    })}
                    className={`w-full rounded-xl border px-4 py-2.5 text-[#3d2c28] placeholder:text-[#b8a69c] focus:outline-none focus:ring-2 transition ${
                      errors.name ?
                        "border-red-300 focus:ring-red-200"
                      : "border-[#F5EBE0] focus:border-[#DBA39A] focus:ring-[#DBA39A]/20"
                    }`}
                    placeholder="e.g. Laptops"
                  />
                  {errors.name && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="size-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#b8a69c]" />
                      <input
                        type="text"
                        {...register("slug", {
                          required: "Slug is required",
                          pattern: {
                            value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                            message: "Lowercase, hyphens only",
                          },
                        })}
                        onChange={(e) => {
                          setValue("slug", e.target.value);
                          setSlugTouched(true);
                        }}
                        className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-[#3d2c28] placeholder:text-[#b8a69c] focus:outline-none focus:ring-2 transition ${
                          errors.slug ?
                            "border-red-300 focus:ring-red-200"
                          : "border-[#F5EBE0] focus:border-[#DBA39A] focus:ring-[#DBA39A]/20"
                        }`}
                        placeholder="laptops"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("slug", slugify(name));
                        setSlugTouched(false);
                      }}
                      className="flex items-center gap-1 rounded-xl border border-[#F5EBE0] px-3 text-xs font-medium text-[#3d2c28] hover:bg-[#F5EBE0]/30"
                    >
                      <Sparkles className="size-3" />
                      Auto
                    </button>
                  </div>
                  {errors.slug && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                      <AlertCircle className="size-3" />
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-[#F5EBE0] px-4 py-2.5 text-[#3d2c28] placeholder:text-[#b8a69c] focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 transition"
                    placeholder="Optional description shown on the storefront"
                  />
                </div>
              </div>

              {/* RIGHT */}
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                    Cover Image <span className="text-red-500">*</span>
                  </label>
                  <ImageUploaderMulti
                    value={image}
                    onChange={setImage}
                    single
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                    Parent Category
                  </label>
                  <div className="relative">
                    <select
                      {...register("parentId")}
                      className="w-full appearance-none rounded-xl border border-[#F5EBE0] px-4 py-2.5 text-[#3d2c28] focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 transition"
                    >
                      <option value="">— None (top level) —</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#3d2c28]/40" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    {...register("sortOrder")}
                    className="w-full rounded-xl border border-[#F5EBE0] px-4 py-2.5 text-[#3d2c28] focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 transition"
                  />
                </div>

                <label className="flex items-center justify-between rounded-xl border border-[#F5EBE0] bg-[#F5EBE0]/30 p-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#3d2c28]">
                      Active
                    </h3>
                    <p className="text-xs text-[#3d2c28]/60">
                      Show on storefront
                    </p>
                  </div>
                  <div className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      {...register("isActive")}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#DBA39A] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DBA39A]/20" />
                  </div>
                </label>
              </div>
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
                    <span>Creating…</span>
                  </>
                : <>
                    <Plus className="size-4" />
                    <span>Create Category</span>
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
