import { Skeleton } from "@/components/ui/skeleton"

export default function MembersLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* 2 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Members table */}
      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-3 gap-4 px-6 py-3 border-b border-border">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-border last:border-0">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
