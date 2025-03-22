const PaymentSkeleton = () => {
    return (
        <div className="container py-10">
            {/* Helmet Placeholder */}
            <div className="w-full h-6 bg-gray-200/50 animate-pulse rounded-md mb-4"></div>

            {/* Countdown Placeholder */}
            <div className="w-40 h-6 bg-gray-200/50 animate-pulse rounded-md mb-4"></div>

            {/* Title Placeholder */}
            <div className="flex items-center w-full gap-1 mb-4">
                <div className="w-8 h-8 bg-gray-200/50 animate-pulse rounded-md"></div>
                <div className="w-32 h-6 bg-gray-200/50 animate-pulse rounded-md"></div>
                <div className="w-16 h-6 bg-gray-200/50 animate-pulse rounded-md"></div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-3 mt-5">
                <div className="flex flex-col gap-5 lg:flex-row">
                    {/* Customer Info Skeleton */}
                    <div className="w-full lg:w-1/3">
                        <div className="h-8 bg-gray-200/50 animate-pulse rounded-md"></div>
                        <div className="flex flex-col gap-3 p-3 mt-2 border rounded-md">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="grid grid-cols-2 gap-2">
                                    <div className="w-24 h-4 bg-gray-200/50 animate-pulse rounded-md"></div>
                                    <div className="w-32 h-4 bg-gray-200/50 animate-pulse rounded-md"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Info Skeleton */}
                    <div className="w-full lg:w-2/3">
                        <div className="grid w-full grid-cols-5 px-4 py-3 mb-2 text-sm font-thin rounded-md bg-gray-200/50 animate-pulse"></div>
                        <div className="flex flex-col w-full border rounded-md">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="grid items-center w-full gap-4 p-4 border-b">
                                    <div className="grid flex-row items-center w-full grid-cols-5">
                                        <div className="flex w-full col-span-2 gap-2">
                                            <div className="w-16 h-16 bg-gray-200/50 animate-pulse rounded-md"></div>
                                            <div className="w-32 h-6 bg-gray-200/50 animate-pulse rounded-md"></div>
                                        </div>
                                        <div className="w-16 h-6 bg-gray-200/50 animate-pulse rounded-md"></div>
                                        <div className="w-12 h-6 bg-gray-200/50 animate-pulse rounded-md"></div>
                                        <div className="w-20 h-6 bg-gray-200/50 animate-pulse rounded-md"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Method Skeleton */}
                <div className="w-full h-20 bg-gray-200/50 animate-pulse rounded-md"></div>

                {/* Button Skeleton */}
                <div className="flex justify-end py-6">
                    <div className="w-32 h-10 bg-gray-200/50 animate-pulse rounded-md"></div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSkeleton;
