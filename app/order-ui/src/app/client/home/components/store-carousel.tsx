import { useEffect, useState } from 'react'

import {
  Card,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui'

import { Store1, Store2, Store3, Store4 } from '@/assets/images'

const images = [Store1, Store2, Store3, Store4]

export default function StoreCarousel() {
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!api) return

    const intervalId = setInterval(() => {
      api.scrollNext()
    }, 3000) // Trượt mỗi 3 giây

    return () => clearInterval(intervalId)
  }, [api])

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      setApi={setApi}
      className="w-full max-w-6xl"
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index} className="md:basis-1/1 w-full">
            <div className="flex h-[12rem] w-full p-1 sm:h-[28rem]">
              <Card className="w-full">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="aspect-square h-full w-full object-cover"
                />
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
