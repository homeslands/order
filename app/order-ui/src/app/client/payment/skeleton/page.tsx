const PaymentSkeleton = () => {
    return (
        <div className="container py-10">
            {/* Helmet Placeholder */}
            <div className="mb-4 w-full h-6 rounded-md animate-pulse bg-gray-200/50"></div>

            {/* Countdown Placeholder */}
            <div className="mb-4 w-40 h-6 rounded-md animate-pulse bg-gray-200/50"></div>

            {/* Title Placeholder */}
            <div className="flex gap-1 items-center mb-4 w-full">
                <div className="w-8 h-8 rounded-md animate-pulse bg-gray-200/50"></div>
                <div className="w-32 h-6 rounded-md animate-pulse bg-gray-200/50"></div>
                <div className="w-16 h-6 rounded-md animate-pulse bg-gray-200/50"></div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-3 mt-5">
                <div className="flex flex-col gap-5">

                    {/* Order Info Skeleton */}
                    <div className="w-full">
                        <div className="grid grid-cols-5 px-4 py-3 mb-2 w-full text-sm font-thin rounded-md animate-pulse bg-gray-200/50"></div>
                        <div className="flex flex-col w-full rounded-md border">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="grid gap-4 items-center p-4 w-full border-b">
                                    <div className="grid flex-row grid-cols-5 items-center w-full">
                                        <div className="flex col-span-2 gap-2 w-full">
                                            <div className="w-16 h-16 rounded-md animate-pulse bg-gray-200/50"></div>
                                            <div className="w-32 h-6 rounded-md animate-pulse bg-gray-200/50"></div>
                                        </div>
                                        <div className="w-16 h-6 rounded-md animate-pulse bg-gray-200/50"></div>
                                        <div className="w-12 h-6 rounded-md animate-pulse bg-gray-200/50"></div>
                                        <div className="w-20 h-6 rounded-md animate-pulse bg-gray-200/50"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Method Skeleton */}
                <div className="w-full h-20 rounded-md animate-pulse bg-gray-200/50"></div>

                {/* Button Skeleton */}
                <div className="flex justify-end py-6">
                    <div className="w-32 h-10 rounded-md animate-pulse bg-gray-200/50"></div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSkeleton;
