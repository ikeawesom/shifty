import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Admin header bar (desktop only) */}
      <div className="hidden md:flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-64 rounded-full" />
        <Skeleton className="size-9 rounded-full" />
      </div>

      {/* Greeting */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Shifts Overview (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-36" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-1 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>

        {/* Right sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Team Status */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-3 rounded-full mt-1 shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
