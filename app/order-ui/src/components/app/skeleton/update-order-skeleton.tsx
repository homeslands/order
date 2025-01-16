import { Skeleton } from '@/components/ui'

export function UpdateOrderSkeleton() {
    return (
        <div className="container">
            {/* Order type selection skeleton */}
            <div className="p-5 rounded-sm shadow-lg">
                <div className="grid w-full grid-cols-2 gap-2 sm:max-w-xs">
                    <Skeleton className="h-10 rounded-full bg-muted-foreground/5" />
                    <Skeleton className="h-10 rounded-full bg-muted-foreground/5" />
                </div>

                {/* Table list order items skeleton */}
                <div className="my-4">
                    <Skeleton className="h-12 mb-4 text-sm font-thin rounded-md bg-muted-foreground/5" />

                    <div className="flex flex-col border rounded-md bg-muted-foreground/5">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="grid items-center w-full gap-4 p-4 pb-4 rounded-md"
                            >
                                <div className="grid flex-row items-center w-full grid-cols-7">
                                    <div className="flex w-full col-span-2 gap-2">
                                        <Skeleton className="w-20 h-12 rounded-lg sm:h-16 sm:w-24" />
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="w-3/4 h-4" />
                                            <Skeleton className="w-1/2 h-4" />
                                        </div>
                                    </div>
                                    <div className="flex justify-center col-span-2">
                                        <Skeleton className="w-12 h-8" />
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <Skeleton className="w-16 h-4 mx-auto" />
                                    </div>
                                    <div className="flex justify-center col-span-1">
                                        <Skeleton className="w-6 h-6 rounded-full" />
                                    </div>
                                </div>
                                <Skeleton className="w-full h-8 mt-2" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table select skeleton */}
                <Skeleton className="w-full h-10 mt-4 rounded-md bg-muted-foreground/5" />
                <div className="flex justify-end py-4 ">
                    <Skeleton className="w-32 h-10 rounded-md bg-muted-foreground/5" />
                </div>
            </div>
        </div>
    )
}

export default function SkeletonPage() {
    return (
        <div className="container mt-10">
            <UpdateOrderSkeleton />
        </div>
    )
}