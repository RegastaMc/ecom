"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FolderTree,
  Save,
  ChevronDown,
  AlertCircle,
  Tag,
  Trash2,
} from "lucide-react";
import { updateCategory, deleteCategory } from "@/lib/actions/category.actions";
import { ImageUploaderMulti } from "@/components/admin/image-uploader-multi";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
};

type FormValues = {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  sortOrder: string;
  isActive: boolean;
};

export default function EditCategoryForm({
  category,
  parents,
}: {
  category: Category;
  parents: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [image, setImage] = useState<string[]>(
    category.image ? [category.image] : [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    },
  });

  const isActive = watch("isActive");

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

      const result = await updateCategory(category.id, formData);
      if (!result.ok) {
        const firstError = Object.values(result.errors)[0]?.[0];
        throw new Error(firstError ?? "Failed to update");
      }
      toast.success("Category updated successfully");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await deleteCategory(category.id);
      if (!result.ok) {
        throw new Error(result.errors._form?.[0] ?? "Failed to delete");
      }
      toast.success("Category deleted");
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FEFCF3] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3d2c28]">Edit Category</h1>
            <p className="text-sm text-[#3d2c28]/60">
              {category.name || "Untitled"} · /{category.slug}
            </p>
          </div>

          {/* Delete */}
          {!confirmDelete ?
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          : <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2">
              <span className="text-xs text-red-700">Delete this?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#3d2c28] hover:bg-white"
              >
                Cancel
              </button>
            </div>
          }
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
                    className={`w-full rounded-xl border px-4 py-2.5 text-[#3d2c28] focus:outline-none focus:ring-2 transition ${
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

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#3d2c28]">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
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
                      className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-[#3d2c28] focus:outline-none focus:ring-2 transition ${
                        errors.slug ?
                          "border-red-300 focus:ring-red-200"
                        : "border-[#F5EBE0] focus:border-[#DBA39A] focus:ring-[#DBA39A]/20"
                      }`}
                    />
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
                    className="w-full resize-none rounded-xl border border-[#F5EBE0] px-4 py-2.5 text-[#3d2c28] focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 transition"
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
