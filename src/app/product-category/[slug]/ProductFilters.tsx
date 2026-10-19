"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

type Props = {
  currentSort: string;
  currentMin?: number;
  currentMax?: number;
  availableOnly: boolean;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name-asc", label: "Name: A → Z" },
];

export function ProductFilters({
  currentSort,
  currentMin,
  currentMax,
  availableOnly,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [min, setMin] = useState(currentMin?.toString() ?? "");
  const [max, setMax] = useState(currentMax?.toString() ?? "");
  const [available, setAvailable] = useState(availableOnly);
  const [mobileOpen, setMobileOpen] = useState(false);

  function push(next: URLSearchParams) {
    // reset page when filters change
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    push(next);
  }

  function applyPrice() {
    const next = new URLSearchParams(searchParams.toString());
    if (min) next.set("min", min);
    else next.delete("min");
    if (max) next.set("max", max);
    else next.delete("max");
    push(next);
  }

  function toggleAvailable() {
    const nextVal = !available;
    setAvailable(nextVal);
    setParam("available", nextVal ? "1" : null);
  }

  function clearAll() {
    setMin("");
    setMax("");
    setAvailable(false);
    router.push(pathname);
  }

  const hasFilters = currentMin != null || currentMax != null || availableOnly;

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#F5EBE0] bg-white px-4 py-3 text-sm font-medium text-[#3d2c28] lg:hidden"
      >
        <SlidersHorizontal className="size-4" />
        Filters
      </button>

      {/* Panel */}
      <div
        className={`${mobileOpen ? "fixed inset-0 z-50" : "hidden lg:block"}`}
      >
        {mobileOpen && (
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div
          className={`${
            mobileOpen ?
              "absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-6"
            : "rounded-2xl border border-[#F5EBE0] bg-white p-5"
          }`}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#3d2c28]">
              Filters
            </h2>
            {mobileOpen ?
              <button onClick={() => setMobileOpen(false)}>
                <X className="size-5" />
              </button>
            : hasFilters ?
              <button
                onClick={clearAll}
                className="text-xs font-medium text-[#DBA39A] hover:underline"
              >
                Clear all
              </button>
            : null}
          </div>

          {/* Sort */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#3d2c28]/60">
              Sort by
            </label>
            <select
              value={currentSort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="w-full rounded-lg border border-[#F5EBE0] bg-white px-3 py-2.5 text-sm text-[#3d2c28] focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#3d2c28]/60">
              Price range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="w-full rounded-lg border border-[#F5EBE0] px-3 py-2 text-sm focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20"
              />
              <span className="text-[#3d2c28]/40">–</span>
              <input
                type="number"
                placeholder="Max"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="w-full rounded-lg border border-[#F5EBE0] px-3 py-2 text-sm focus:border-[#DBA39A] focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20"
              />
            </div>
            <button
              onClick={applyPrice}
              className="mt-2 w-full rounded-lg bg-[#3d2c28] px-3 py-2 text-xs font-medium text-white hover:bg-[#3d2c28]/90"
            >
              Apply
            </button>
          </div>

          {/* Availability */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#3d2c28]/60">
              Availability
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#F5EBE0] p-3 transition hover:bg-[#F5EBE0]/20">
              <input
                type="checkbox"
                checked={available}
                onChange={toggleAvailable}
                className="size-4 accent-[#DBA39A]"
              />
              <span className="text-sm text-[#3d2c28]">In stock only</span>
            </label>
          </div>

          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full rounded-xl bg-[#DBA39A] py-3 text-sm font-semibold text-white hover:bg-[#c49087]"
            >
              Show results
            </button>
          )}
        </div>
      </div>
    </>
  );
}
