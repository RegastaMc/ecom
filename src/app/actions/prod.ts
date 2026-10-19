"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { Prisma } from "../../../prisma/src/lib/prisma/client";

/* =========================================================
   VALIDATION
   ========================================================= */

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  desc: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be positive"),
  offerPrice: z.coerce
    .number()
    .min(0, "Offer price must be positive")
    .optional()
    .nullable(),
  isAvailable: z.coerce.boolean().default(true),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "At least one image is required"),
});

/* =========================================================
   HELPERS
   ========================================================= */

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "product";
  let slug = base;
  let i = 1;

  while (true) {
    const existing = await db.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${i++}`;
  }
}

/**
 * Validates that the categoryId exists and — if subCategoryId is
 * provided — that it's actually a child of that category.
 */
async function validateCategoryPair(
  categoryId: string,
  subCategoryId: string | null | undefined,
) {
  const category = await db.category.findUnique({
    where: { id: categoryId },
    select: { id: true, parentId: true },
  });

  if (!category) {
    return { ok: false as const, error: "Selected category does not exist" };
  }

  if (category.parentId) {
    return {
      ok: false as const,
      error: "Selected category is a subcategory, not a top-level category",
    };
  }

  if (subCategoryId) {
    const sub = await db.category.findUnique({
      where: { id: subCategoryId },
      select: { id: true, parentId: true },
    });

    if (!sub) {
      return {
        ok: false as const,
        error: "Selected subcategory does not exist",
      };
    }

    if (sub.parentId !== categoryId) {
      return {
        ok: false as const,
        error: "Subcategory does not belong to the selected category",
      };
    }
  }

  return { ok: true as const };
}

function mapPrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return "A product with that slug already exists";
      case "P2003":
        return "Referenced category does not exist";
      case "P2025":
        return "Product not found";
      default:
        return `Database error (${error.code})`;
    }
  }
  return "Something went wrong";
}

/* =========================================================
   CREATE
   ========================================================= */

export async function createProduct(input: unknown) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input",
    };
  }

  const data = parsed.data;

  // Verify category/subcategory relationship
  const pairCheck = await validateCategoryPair(
    data.categoryId,
    data.subCategoryId,
  );
  if (!pairCheck.ok) {
    return { success: false as const, error: pairCheck.error };
  }

  try {
    const product = await db.product.create({
      data: {
        name: data.name,
        desc: data.desc || null,
        price: data.price,
        offerPrice: data.offerPrice ?? null,
        isAvailable: data.isAvailable,
        images: data.images,
        slug: await generateUniqueSlug(data.name),
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId || null,
      },
    });

    // Invalidate cached category listings + product pages
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath(`/product-category`); // all category pages
    revalidateTag("categories");
    revalidateTag("products");

    return { success: true as const, product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false as const, error: mapPrismaError(error) };
  }
}

/* =========================================================
   UPDATE
   ========================================================= */

export async function updateProduct(input: {
  id: string;
  name: string;
  desc: string | null;
  categoryId: string;
  subCategoryId?: string | null;
  price: number;
  offerPrice: number | null;
  isAvailable: boolean;
  images: string[];
  deletedImages?: string[];
}) {
  // Reuse the schema (strip id + deletedImages)
  const { id, deletedImages, ...fields } = input;

  const parsed = productSchema.safeParse(fields);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input",
    };
  }

  const data = parsed.data;

  const pairCheck = await validateCategoryPair(
    data.categoryId,
    data.subCategoryId,
  );
  if (!pairCheck.ok) {
    return { success: false as const, error: pairCheck.error };
  }

  try {
    const product = await db.product.update({
      where: { id },
      data: {
        name: data.name,
        desc: data.desc || null,
        price: data.price,
        offerPrice: data.offerPrice ?? null,
        isAvailable: data.isAvailable,
        images: data.images,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId || null,
      },
    });

    // Optional: delete removed images from Cloudinary
    if (deletedImages?.length) {
      await Promise.allSettled(
        deletedImages.map((url) => deleteCloudinaryImage(url)),
      );
    }

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath(`/products/${product.slug ?? id}`);
    revalidateTag("categories");
    revalidateTag("products");

    return { success: true as const, product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false as const, error: mapPrismaError(error) };
  }
}

/* =========================================================
   DELETE
   ========================================================= */

export async function deleteProduct(id: string) {
  try {
    const product = await db.product.delete({ where: { id } });

    // Best-effort image cleanup
    const imgs =
      Array.isArray(product.images) ? (product.images as string[]) : [];
    await Promise.allSettled(imgs.map((url) => deleteCloudinaryImage(url)));

    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidateTag("categories");
    revalidateTag("products");

    return { success: true as const };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false as const, error: mapPrismaError(error) };
  }
}

/* =========================================================
   READ
   ========================================================= */

export async function getProductById(id: string) {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      return {
        success: false as const,
        error: "Product not found",
        product: null,
      };
    }

    return { success: true as const, product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false as const,
      error: "Failed to fetch product",
      product: null,
    };
  }
}

export const getproductCount = async () => {
  try {
    const count = await db.product.count();
    return count;
  } catch (error) {
    console.error("Error fetching product count:", error);
    return 0;
  }
};

/* =========================================================
   CLOUDINARY CLEANUP (best-effort)
   ========================================================= */

async function deleteCloudinaryImage(url: string) {
  try {
    const parts = url.split("/upload/");
    if (parts.length !== 2) return;

    const pathParts = parts[1].split("/");
    const vIdx = pathParts.findIndex((p) => p.startsWith("v"));
    const startIdx = vIdx !== -1 ? vIdx + 1 : 0;
    const publicId = pathParts
      .slice(startIdx)
      .join("/")
      .replace(/\.[^/.]+$/, "");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) return;

    // Signed delete (server-side)
    const crypto = await import("crypto");
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    const body = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature,
    });

    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body,
    });
  } catch (err) {
    // Non-fatal — logs only
    console.warn("Cloudinary cleanup failed:", err);
  }
}
