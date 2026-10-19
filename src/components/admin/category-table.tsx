"use client";

import Link from "next/link";
import Image from "next/image";
import { Pencil, ImageOff } from "lucide-react";
import { CategoryDeleteButton } from "./category-delete-button";

type Row = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  parent: { id: string; name: string } | null;
  _count: { products: number; children: number };
};

export function CategoryTable({ categories }: { categories: Row[] }) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-16 text-center">
        <p className="text-muted-foreground">
          No categories yet. Create your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr className="text-left">
            <th className="p-3 font-medium">Category</th>
            <th className="p-3 font-medium">Parent</th>
            <th className="p-3 font-medium text-center">Products</th>
            <th className="p-3 font-medium text-center">Subcats</th>
            <th className="p-3 font-medium text-center">Status</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {c.image ?
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    : <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageOff className="size-4" />
                      </div>
                    }
                  </div>
                  <div>
                    <p className="font-medium">{c.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{c.slug}</p>
                  </div>
                </div>
              </td>
              <td className="p-3 text-muted-foreground">
                {c.parent?.name ?? "—"}
              </td>
              <td className="p-3 text-center">{c._count.products}</td>
              <td className="p-3 text-center">{c._count.children}</td>
              <td className="p-3 text-center">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                    c.isActive ?
                      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {c.isActive ? "Active" : "Hidden"}
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/dashboard/id/categories/${c.slug}/edit`}
                    className="flex size-8 items-center justify-center rounded-md transition hover:bg-muted"
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <CategoryDeleteButton
                    id={c.id}
                    name={c.name}
                    hasProducts={c._count.products > 0}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
