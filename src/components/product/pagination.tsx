import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string>;
};

function buildHref(base: string, params: Record<string, string>, page: number) {
  const qs = new URLSearchParams({ ...params, page: String(page) });
  return `${base}?${qs.toString()}`;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  extraParams = {},
}: Props) {
  const pages = new Set<number>([1, totalPages]);
  for (
    let i = Math.max(1, currentPage - 1);
    i <= Math.min(totalPages, currentPage + 1);
    i++
  ) {
    pages.add(i);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  return (
    <nav className="flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link
          href={buildHref(basePath, extraParams, currentPage - 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-[#F5EBE0] bg-white text-[#3d2c28] transition hover:border-[#DBA39A] hover:text-[#DBA39A]"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Link>
      )}

      {sorted.map((p, i) => {
        const prev = sorted[i - 1];
        const gap = prev && p - prev > 1;
        return (
          <div key={p} className="flex items-center gap-1">
            {gap && <span className="px-1 text-sm text-[#3d2c28]/40">…</span>}
            {p === currentPage ?
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#DBA39A] text-sm font-semibold text-white">
                {p}
              </span>
            : <Link
                href={buildHref(basePath, extraParams, p)}
                className="flex size-9 items-center justify-center rounded-lg border border-[#F5EBE0] bg-white text-sm text-[#3d2c28] transition hover:border-[#DBA39A] hover:text-[#DBA39A]"
              >
                {p}
              </Link>
            }
          </div>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={buildHref(basePath, extraParams, currentPage + 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-[#F5EBE0] bg-white text-[#3d2c28] transition hover:border-[#DBA39A] hover:text-[#DBA39A]"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Link>
      )}
    </nav>
  );
}
