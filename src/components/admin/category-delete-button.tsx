"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCategory } from "@/lib/actions/category.actions";

export function CategoryDeleteButton({
  id,
  name,
  hasProducts,
}: {
  id: string;
  name: string;
  hasProducts: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.ok) {
        toast.success(`"${name}" deleted`);
        setConfirming(false);
      } else {
        toast.error(result.errors._form?.[0] ?? "Failed to delete");
      }
    });
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        disabled={hasProducts}
        title={hasProducts ? "Cannot delete: has products" : "Delete"}
        className="flex size-8 items-center justify-center rounded-md text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Delete"
      >
        <Trash2 className="size-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "…" : "Yes"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-md px-2 py-1 text-xs hover:bg-muted"
      >
        No
      </button>
    </div>
  );
}
