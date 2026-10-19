export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FEFCF3]">
      <div className="h-[260px] w-full animate-pulse bg-[#253C6D]/30 md:h-[320px]" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="hidden h-96 animate-pulse rounded-2xl bg-white/60 lg:block" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-3/4 animate-pulse rounded-xl bg-white/60" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/60" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-white/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
