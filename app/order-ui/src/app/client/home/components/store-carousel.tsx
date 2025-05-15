import { TrendCoffee1, TrendCoffee2, TrendCoffee3, TrendCoffee4 } from '@/assets/images'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'

const images = [TrendCoffee1, TrendCoffee2, TrendCoffee3, TrendCoffee4]

export default function StoreCarousel() {
  return (
    <Swiper
      autoplay={{
        delay: 2500,
        pauseOnMouseEnter: true,
        disableOnInteraction: false,
      }}
      loop={true}
      modules={[Autoplay, Navigation, Pagination]}
      className="w-full max-w-6xl"   >
      {images.map((image, index) =>
        <SwiperSlide key={index} className="w-full md:basis-1/1">
          <div className="flex h-[12rem] w-full p-1 sm:h-[28rem]">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="object-cover w-full h-full aspect-square"
            />
          </div>
        </SwiperSlide>
      )}
    </Swiper>
  )
}
