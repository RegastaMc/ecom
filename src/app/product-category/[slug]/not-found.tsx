import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#FEFCF3] px-4 text-center">
      <PackageX className="mb-4 size-16 text-[#b8a69c]" />
      <h1 className="text-2xl font-bold text-[#3d2c28]">Category not found</h1>
      <p className="mt-2 max-w-md text-sm text-[#3d2c28]/60">
        This category may have been removed or renamed.
      </p>
      <Link
        href="/products"
        className="mt-6 rounded-full bg-[#DBA39A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c49087]"
      >
        Browse all products
      </Link>
    </div>
  );
}
