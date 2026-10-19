"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ImageUploader } from "./image-uploader";

type ActionResult =
  | { ok: true; id: string }
  | { ok: false; errors: Record<string, string[]> };

type ParentOption = { id: string; name: string; depth: number };

type Props = {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<ActionResult>;
  parents: ParentOption[];
  defaults?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string | null;
    image?: string | null;
    parentId?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  };
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({ mode, action, parents, defaults }: Props) {
  const [state, formAction, isPending] = useActionState(
    (_prev: ActionResult | null, formData: FormData) => action(formData),
    null,
  );

  const [name, setName] = useState(defaults?.name ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [image, setImage] = useState(defaults?.image ?? "");

  // auto-generate slug from name (create mode only, until user edits)
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  useEffect(() => {
    if (state?.ok) {
      toast.success(
        mode === "create" ? "Category created" : "Category updated",
      );
    } else if (state && !state.ok && state.errors._form) {
      toast.error(state.errors._form[0]);
    }
  }, [state, mode]);

  const errors = useMemo(
    () => (!state || state.ok ? {} : state.errors),
    [state],
  );

  return (
    <form action={formAction} className="space-y-6">
      {state?.ok && (
        <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {mode === "create" ? "Category created." : "Changes saved."} —{" "}
          <Link href="/admin/categories" className="underline">
            Back to list
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT — main fields */}
        <div className="space-y-5 lg:col-span-2">
          <Field label="Name" error={errors.name}>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Laptops"
              className="input"
            />
          </Field>

          <Field
            label="Slug"
            error={errors.slug}
            hint="Used in URLs. Lowercase, hyphens only."
          >
            <div className="flex gap-2">
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                placeholder="laptops"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  setSlug(slugify(name));
                  setSlugTouched(false);
                }}
                className="rounded-lg border px-3 text-xs font-medium hover:bg-muted"
              >
                Auto
              </button>
            </div>
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              name="description"
              rows={4}
              defaultValue={defaults?.description ?? ""}
              placeholder="Optional description shown on the storefront"
              className="input resize-none"
            />
          </Field>
        </div>

        {/* RIGHT — sidebar */}
        <div className="space-y-5">
          <Field label="Image" error={errors.image}>
            <ImageUploader value={image} onChange={setImage} />
            <input type="hidden" name="image" value={image} />
          </Field>

          <Field label="Parent category" error={errors.parentId}>
            <select
              name="parentId"
              defaultValue={defaults?.parentId ?? ""}
              className="input"
            >
              <option value="">— None (top level) —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {"— ".repeat(p.depth)}
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sort order" error={errors.sortOrder}>
            <input
              type="number"
              name="sortOrder"
              min={0}
              defaultValue={defaults?.sortOrder ?? 0}
              className="input"
            />
          </Field>

          <label className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={defaults?.isActive ?? true}
              value="true"
              className="size-4 rounded"
            />
            <span className="text-sm">
              <span className="font-medium">Active</span>
              <span className="block text-xs text-muted-foreground">
                Show on storefront
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Link
          href="/admin/categories"
          className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ?
            "Saving…"
          : mode === "create" ?
            "Create category"
          : "Save changes"}
        </button>
      </div>
    </form>
  );
}

/* Small helper for label + error */
function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error[0]}</p>}
    </div>
  );
}
