import { Skeleton } from '@/components/ui'

export function SkeletonCart() {
  return (
    <div className="flex flex-col h-full bg-muted/50">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 bg-white shadow-sm">
        <Skeleton className="w-32 h-6 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="w-24 h-10 rounded-full" />
          <Skeleton className="w-24 h-10 rounded-full" />
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <Skeleton className="w-[72px] h-[72px] rounded-lg" />
              <div className="flex-1">
                <Skeleton className="w-3/4 h-5 mb-2" />
                <Skeleton className="w-1/4 h-4" />
                <Skeleton className="w-1/3 h-4 mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="rounded-md w-7 h-7" />
                <Skeleton className="w-5 h-5" />
                <Skeleton className="rounded-md w-7 h-7" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-6 space-y-4">
          <Skeleton className="w-full h-10 rounded-lg" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="w-1/3 h-4" />
                <Skeleton className="w-1/4 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 p-4 bg-white border-t">
        <Skeleton className="w-full h-12 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonMenuList() {
  return (
    <div className="flex flex-col border bg-muted/50 rounded-xl">
      <div className="relative p-2">
        <Skeleton className="w-full h-32 rounded-lg bg-gray-300" />
      </div>
      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 space-y-2">
        {/* Name */}
        <Skeleton className="w-3/4 h-4 bg-gray-300" />

        {/* Description */}
        <div className="space-y-1">
          <Skeleton className="w-full h-3 bg-gray-300" />
        </div>

        {/* Price and Add button */}
        <Skeleton className="w-24 h-6 bg-gray-300" />


      </div>
    </div>
  )
}
