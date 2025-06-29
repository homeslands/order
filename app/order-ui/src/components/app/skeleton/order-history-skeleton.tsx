import { Skeleton } from '@/components/ui'

export default function OrderHistorySkeleton() {
    return (
        <div className="mb-4">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="mb-6 border rounded-md bg-muted/50 dark:bg-transparent">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b rounded-t-md">
                        <Skeleton className="h-4 w-36 dark:bg-muted" /> {/* DateTime */}
                        <Skeleton className="w-24 h-6 dark:bg-muted" /> {/* Status Badge */}
                    </div>

                    {/* Order Items */}
                    <div className="flex flex-col divide-y">
                        {[...Array(1)].map((_, itemIndex) => (
                            <div key={itemIndex} className="grid items-center grid-cols-12 gap-2 p-4">
                                {/* Product Image */}
                                <div className="relative col-span-4">
                                    <div className="relative w-full h-16">
                                        <Skeleton className="w-full h-full rounded-md dark:bg-muted" />
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="col-span-6 px-4">
                                    <Skeleton className="w-3/4 h-5 mb-2 dark:bg-muted" /> {/* Product Name */}
                                    <Skeleton className="w-1/2 h-4 dark:bg-muted" /> {/* Size and Price */}
                                </div>

                                {/* Total Price */}
                                <div className="col-span-2">
                                    <Skeleton className="w-full h-5 dark:bg-muted" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col justify-end gap-2 p-4">
                        <div className="flex items-center justify-between">
                            <Skeleton className="w-24 h-9 dark:bg-muted" /> {/* View Detail Button */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-16 h-5 dark:bg-muted" /> {/* Subtotal Label */}
                                <Skeleton className="w-24 h-5 dark:bg-muted" /> {/* Subtotal Amount */}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
