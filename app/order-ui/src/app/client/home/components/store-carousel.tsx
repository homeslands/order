import { Store1, Store2, Store3, Store4 } from '@/assets/images'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'

const images = [Store1, Store2, Store3, Store4]

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
        <SwiperSlide key={index} className="md:basis-1/1 w-full">
          <div className="flex h-[12rem] w-full p-1 sm:h-[28rem]">
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className="aspect-square h-full w-full object-cover"
            />
          </div>
        </SwiperSlide>
      )}
    </Swiper>
  )
}
