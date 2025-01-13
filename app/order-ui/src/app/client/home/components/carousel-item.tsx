import {
  Card,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui";

import { Ga, Bia, Tom, Com } from "@/assets/images";

const images = [Ga, Bia, Tom, Com]; // Danh sách hình ảnh

export default function CarouselSize() {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full max-w-6xl"
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index} className="w-full md:basis-1/3">
            <div className="p-1 w-full h-[12rem] flex">
              <Card className="w-full">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="object-cover w-full h-full rounded-md aspect-square"
                />
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}





