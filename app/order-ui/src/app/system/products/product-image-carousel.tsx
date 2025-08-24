import DeleteProductImageDialog from "@/components/app/dialog/delete-product-images-dialog";
import {
    Card,
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui";
import { publicFileURL } from "@/constants";
import { useState } from "react";
import ProductImage from "@/assets/images/ProductImage.png";

export default function ProductImageCarousel({
    images,
    onImageClick,
}: {
    images: string[];
    onImageClick: (image: string) => void;
}) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleImageClick = (image: string, index: number) => {
        setSelectedIndex(index);
        onImageClick(image);
    };

    return (
        <div className="w-full">
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
            >
                <CarouselContent>
                    {images.map((image, index) => (
                        <CarouselItem key={index} className="w-full md:basis-1/3">
                            <div className="flex p-1 w-full">
                                <Card
                                    className={`relative w-full cursor-pointer group transition-all duration-300 ease-in-out hover:ring-2 hover:ring-primary ${selectedIndex === index ? "ring-2 ring-primary" : ""
                                        }`}
                                    onClick={() => handleImageClick(image, index)}
                                >
                                    <div className="flex absolute top-0 right-0 z-10 justify-end items-start opacity-0 transition-opacity group-hover:opacity-100">
                                        <div className="p-1 m-1 rounded-md">
                                            <DeleteProductImageDialog image={image} />
                                        </div>
                                    </div>
                                    <img
                                        src={image ? `${publicFileURL}/${image}` : ProductImage}
                                        alt={`${index + 1}`}
                                        className="object-cover w-full h-28 rounded-md"
                                    />
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Paging dots */}
            <div className="flex justify-center mt-2 space-x-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${selectedIndex === index ? "bg-primary" : "bg-gray-300"
                            }`}
                        onClick={() => setSelectedIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
}
