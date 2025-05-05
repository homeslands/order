import { Skeleton } from '@/components/ui'

export function SkeletonCart() {
  return (
    <div className="flex flex-col h-full bg-muted/50">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 bg-white shadow-sm">
        <Skeleton className="mb-4 w-32 h-6" />
        <div className="flex gap-3">
          <Skeleton className="w-24 h-10 rounded-full" />
          <Skeleton className="w-24 h-10 rounded-full" />
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 items-center p-3 bg-white rounded-xl">
              <Skeleton className="w-[72px] h-[72px] rounded-lg" />
              <div className="flex-1">
                <Skeleton className="mb-2 w-3/4 h-5" />
                <Skeleton className="w-1/4 h-4" />
                <Skeleton className="mt-1 w-1/3 h-4" />
              </div>
              <div className="flex gap-2 items-center">
                <Skeleton className="w-7 h-7 rounded-md" />
                <Skeleton className="w-5 h-5" />
                <Skeleton className="w-7 h-7 rounded-md" />
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
    <div className="flex flex-row sm:flex-col justify-between bg-white rounded-xl border backdrop-blur-md border-muted-foreground/40 min-h-[8rem] sm:min-h-[22rem] dark:bg-transparent">
      {/* Image Section */}
      <div className="relative flex-shrink-0 justify-center items-center px-2 py-4 w-24 h-full sm:p-0 sm:w-full sm:h-48">
        <Skeleton className="w-full h-full rounded-md sm:rounded-t-xl sm:rounded-b-none sm:h-48 bg-muted-foreground/20" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 justify-between p-2">
        <div className="h-auto sm:h-[5rem]">
          <Skeleton className="mb-2 w-3/4 h-4 bg-muted-foreground/20" />
          <div className="space-y-1">
            <Skeleton className="w-full h-3 bg-muted-foreground/20" />
            <Skeleton className="w-2/3 h-3 bg-muted-foreground/20" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Skeleton className="w-1/3 h-4 bg-muted-foreground/20" />
          <Skeleton className="w-1/4 h-3 bg-muted-foreground/20" />
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end items-end p-2 sm:w-full">
        <Skeleton className="w-8 h-8 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  )
}
