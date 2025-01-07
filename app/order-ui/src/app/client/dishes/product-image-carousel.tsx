import { useCallback, useEffect, useState } from "react";

import {
    Card,
    Carousel,
    CarouselApi,
    CarouselContent,
    CarouselItem,
} from "@/components/ui";
import { publicFileURL } from "@/constants";

export default function ProductImageCarousel({
    images,
    onImageClick
}: {
    images: string[],
    onImageClick: (image: string) => void
}) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [autoScroll, setAutoScroll] = useState(true);

    const handleImageClick = (image: string, index: number) => {
        setAutoScroll(false);  // Disable auto-scroll when manually clicking
        setSelectedIndex(index);
        setCurrent(index);
        api?.scrollTo(index);
        onImageClick(image);
    };

    const onSelect = useCallback(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());
    }, [api]);

    useEffect(() => {
        if (!api || !autoScroll) return;

        const intervalId = setInterval(() => {
            api.scrollNext();
        }, 3000);  // Added interval duration

        api.on("select", onSelect);

        return () => {
            clearInterval(intervalId);
            api.off("select", onSelect);
        };
    }, [api, onSelect, autoScroll]);

    // Re-enable auto-scroll after 5 seconds of inactivity
    useEffect(() => {
        if (autoScroll) return;

        const timeoutId = setTimeout(() => {
            setAutoScroll(true);
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, [autoScroll]);

    return (
        <div className="flex flex-col items-center w-full gap-2">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,  // Enable loop
                }}
                setApi={setApi}
                className="w-full"
            >
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={index} className="w-full basis-1/2 md:basis-1/3">
                            <div className="flex w-full py-1">
                                <Card
                                    className={`relative w-full cursor-pointer group transition-all duration-300 ease-in-out hover:ring-2 hover:ring-primary ${selectedIndex === index ? 'ring-2 ring-primary' : ''
                                        }`}
                                    onClick={() => handleImageClick(image, index)}
                                >
                                    <img
                                        src={`${publicFileURL}/${image}`}
                                        alt={`${index + 1}`}
                                        className="object-cover w-full rounded-md h-28"
                                    />
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            {images.length > 1 && (
                <div className="flex gap-2 mt-4">
                    {images?.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${current === index ? "bg-primary w-4" : "bg-gray-300"
                                }`}
                            onClick={() => handleImageClick(images[index], index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}





