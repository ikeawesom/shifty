import { Skeleton } from "@/components/ui/skeleton"

export default function ShiftsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      {/* Shift cards */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
