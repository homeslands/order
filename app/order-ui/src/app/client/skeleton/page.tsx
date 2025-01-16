import { Skeleton } from "@/components/ui/skeleton"

export default function UpdateOrderSkeleton() {
    return (
        <div className="container py-10">
            <div className="p-5 bg-white rounded-sm shadow-lg">
                {/* Order type selection skeleton */}
                <div className="grid w-full grid-cols-2 gap-2 sm:max-w-xs">
                    <Skeleton className="h-10 rounded-full" />
                    <Skeleton className="h-10 rounded-full" />
                </div>

                {/* Table header skeleton */}
                <div className="my-4">
                    <div className="grid grid-cols-7 px-4 py-3 mb-4 rounded-md bg-muted/60">
                        {[...Array(7)].map((_, i) => (
                            <Skeleton key={i} className="h-4" />
                        ))}
                    </div>

                    {/* Order items skeleton */}
                    <div className="flex flex-col gap-4 p-4 border rounded-md">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="grid items-center grid-cols-7 gap-4">
                                <div className="flex col-span-2 gap-2">
                                    <Skeleton className="w-24 h-16 rounded-lg" />
                                    <div className="flex flex-col gap-2">
                                        <Skeleton className="w-24 h-4" />
                                        <Skeleton className="w-16 h-4" />
                                    </div>
                                </div>
                                <div className="flex justify-center col-span-2">
                                    <Skeleton className="w-24 h-8" />
                                </div>
                                <div className="flex justify-center col-span-2">
                                    <Skeleton className="w-20 h-4" />
                                </div>
                                <div className="flex justify-center col-span-1">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table selection skeleton */}
                <div className="mt-6">
                    <Skeleton className="h-[200px] rounded-md" />
                </div>

                {/* Action button skeleton */}
                <div className="flex justify-end py-4">
                    <Skeleton className="h-10 w-[10rem]" />
                </div>
            </div>
        </div>
    )
}
