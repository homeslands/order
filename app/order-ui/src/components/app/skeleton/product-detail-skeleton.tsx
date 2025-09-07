import { Skeleton } from '@/components/ui'

export default function ProductDetailSkeleton() {
  return (
    <div className="flex bg-muted-foreground/15 dark:bg-muted-foreground/5 flex-row gap-2 h-[calc(100vh-4rem)]">
      <div className="flex-1">
        <div className="pl-4 transition-all duration-300 ease-in-out">
          {/* Header Section */}
          <div className="flex sticky top-0 z-10 flex-col gap-2 items-center py-3 pr-4">
            {/* Breadcrumb */}
            <div className="flex flex-row justify-between items-center w-full">
              <Skeleton className="w-1/4 h-6" />
            </div>

            {/* Title */}
            <div className="flex flex-col flex-1 mt-1 w-full">
              <div className="flex flex-row justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Skeleton className="w-6 h-6" />
                  <Skeleton className="w-32 h-6" />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex flex-col gap-4">
                {/* Product Details Grid */}
                <div className="grid grid-cols-2 gap-4 pb-8 mt-4 w-full border-b">
                  {/* Left Column - Images */}
                  <div className="flex flex-col col-span-1 gap-2 h-full">
                    <Skeleton className="w-full h-[300px] rounded-xl" />
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="w-full h-[100px] rounded-md" />
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Product Info */}
                  <div className="col-span-1">
                    <div className="flex flex-col gap-4">
                      <Skeleton className="w-3/4 h-10" /> {/* Name */}
                      <Skeleton className="w-full h-20" /> {/* Description */}
                      <Skeleton className="w-32 h-6" /> {/* Rating */}
                    </div>
                  </div>
                </div>

                {/* Variants Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center w-full">
                    <Skeleton className="w-32 h-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
