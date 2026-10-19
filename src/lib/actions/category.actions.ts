"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categorySchema } from "@/lib/validators/category";
import { db } from "../db";
import { Prisma } from "../../../prisma/src/lib/prisma/client";

type ActionResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string[]> };

/* ---------------- CREATE ---------------- */
export async function createCategory(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    const created = await db.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        image: parsed.data.image || null,
        parentId: parsed.data.parentId || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });
    revalidatePath("/admin/categories");
    return { ok: true, id: created.id };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { ok: false, errors: { slug: ["Slug already exists"] } };
    }
    throw e;
  }
}

/* ---------------- UPDATE ---------------- */
export async function updateCategory(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  // Prevent a category from being its own parent
  if (parsed.data.parentId === id) {
    return { ok: false, errors: { parentId: ["Cannot be its own parent"] } };
  }

  try {
    await db.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        image: parsed.data.image || null,
        parentId: parsed.data.parentId || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}/edit`);
    return { ok: true, id };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { ok: false, errors: { slug: ["Slug already exists"] } };
    }
    throw e;
  }
}

/* ---------------- DELETE ---------------- */
export async function deleteCategory(id: string): Promise<ActionResult> {
  const productCount = await db.product.count({
    where: { categoryId: id },
  });
  if (productCount > 0) {
    return {
      ok: false,
      errors: {
        _form: [
          `Cannot delete: ${productCount} product(s) still reference this category.`,
        ],
      },
    };
  }

  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true, id };
}

/* ---------------- Quick slug suggester ---------------- */
export async function suggestSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!base) return "";

  let slug = base;
  let i = 1;
  while (
    await db.category.findUnique({ where: { slug }, select: { id: true } })
  ) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
