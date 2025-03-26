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
    onImageClick
}: {
    images: string[],
    onImageClick: (image: string) => void
}) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleImageClick = (image: string, index: number) => {
        setSelectedIndex(index);
        onImageClick(image);
    };

    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-full"
        >
            <CarouselContent>
                {images.map((image, index) => (
                    <CarouselItem key={index} className="w-full md:basis-1/3">
                        <div className="flex w-full p-1">
                            <Card
                                className={`relative w-full cursor-pointer group transition-all duration-300 ease-in-out hover:ring-2 hover:ring-primary ${selectedIndex === index ? 'ring-2 ring-primary' : ''
                                    }`}
                                onClick={() => handleImageClick(image, index)}
                            >
                                <div className="absolute top-0 right-0 z-10 flex items-start justify-end transition-opacity opacity-0 group-hover:opacity-100">
                                    <div className="p-1 m-1 rounded-md">
                                        <DeleteProductImageDialog image={image} />
                                    </div>
                                </div>
                                <img
                                    src={image ? `${publicFileURL}/${image}`: ProductImage}
                                    alt={`${index + 1}`}
                                    className="object-cover w-full rounded-md h-28"
                                />
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    );
}





