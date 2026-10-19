"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function AdminTopbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="text-sm text-muted-foreground">Admin panel</div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          View store <ExternalLink className="size-3" />
        </Link>
      </div>
    </header>
  );
}
