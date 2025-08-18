import React from 'react'
// import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules'
// import { useTranslation } from 'react-i18next'

import {
  LandingPageBackground,
  LandingPageBackgroundMobile,
} from '@/assets/images'
import { useIsMobile } from '@/hooks'
import { IBanner } from '@/types'
import { publicFileURL } from '@/constants/env'
// import { Button } from '@/components/ui'

export default function SwiperBanner({
  bannerData,
}: {
  bannerData: IBanner[]
}): React.ReactElement {
  const isMobile = useIsMobile()
  // const { t } = useTranslation(['banner'])
  // const [, setIsImageLoaded] = useState(false)

  return (
    <Swiper
      pagination={{
        dynamicBullets: true,
        clickable: true,
      }}
      autoplay={{
        delay: 3000,
        pauseOnMouseEnter: true,
        disableOnInteraction: false,
      }}
      loop={true}
      speed={800}
      effect="slide"
      slidesPerView={1}
      spaceBetween={0}
      modules={[Autoplay, Pagination, Navigation, EffectFade]}
      className={`relative ${isMobile ? 'aspect-video' : 'h-[60vh]'} w-full`}
      allowTouchMove={true}
    >
      {bannerData?.map((banner, index) => {
        const bgImage = banner.image
          ? publicFileURL + '/' + banner.image
          : isMobile
            ? LandingPageBackgroundMobile
            : LandingPageBackground

        return (
          <SwiperSlide key={index} className="flex items-center justify-center bg-black">
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {/* Ảnh nền mờ + scale */}
              <img
                src={bgImage}
                alt="blurred background"
                className="absolute top-0 left-0 object-cover w-full h-full scale-110 blur-md"
                aria-hidden="true"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.8)] via-transparent to-[rgba(255,255,255,0.8)] z-0" />

              {/* Ảnh chính */}
              <img
                src={bgImage}
                alt="main banner"
                className="relative z-10 object-contain max-h-full max-w-full"
              // onLoad={() => setIsImageLoaded(true)}
              />
            </div>
          </SwiperSlide>
        )
      })}
    </Swiper>
  )
}
