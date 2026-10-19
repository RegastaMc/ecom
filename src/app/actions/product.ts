"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "../../../prisma/src/lib/prisma/client";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  desc: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be positive"),
  offerPrice: z.coerce.number().min(0).optional().nullable(),
  isAvailable: z.coerce.boolean().default(true),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let i = 1;
  while (
    await db.product.findUnique({ where: { slug }, select: { id: true } })
  ) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function createProduct(input: unknown) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input",
    };
  }

  try {
    const product = await db.product.create({
      data: {
        name: parsed.data.name,
        desc: parsed.data.desc || null,
        price: parsed.data.price,
        offerPrice: parsed.data.offerPrice ?? null,
        isAvailable: parsed.data.isAvailable,
        images: parsed.data.images,
        slug: await uniqueSlug(parsed.data.name),
        categoryId: parsed.data.categoryId,
        subCategoryId: parsed.data.subCategoryId || null,
      },
    });
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true, id: product.id };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `Database error: ${e.code}` };
    }
    throw e;
  }
}

export async function updateProduct(id: string, input: unknown) {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input",
    };
  }

  try {
    await db.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        desc: parsed.data.desc || null,
        price: parsed.data.price,
        offerPrice: parsed.data.offerPrice ?? null,
        isAvailable: parsed.data.isAvailable,
        images: parsed.data.images,
        categoryId: parsed.data.categoryId,
        subCategoryId: parsed.data.subCategoryId || null,
      },
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    return { success: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return { success: false, error: `Database error: ${e.code}` };
    }
    throw e;
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete product" };
  }
}
