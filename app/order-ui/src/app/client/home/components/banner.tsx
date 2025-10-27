import React, { useState } from 'react'
// import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules'
// import { useTranslation } from 'react-i18next'

import {
  LandingPageBackground,
  LandingPageBackgroundMobile,
} from '@/assets/images'
import { useIsMobile } from '@/hooks'
import { IBanner } from '@/types'
import { publicFileURL, ROUTE } from '@/constants'

export default function SwiperBanner({
  bannerData,
}: {
  bannerData: IBanner[]
}): React.ReactElement {
  const isMobile = useIsMobile()
  const [, setIsImageLoaded] = useState(false)

  // Helper function để xác định URL đích
  const getBannerLink = (banner: IBanner): string => {
    if (banner.url && banner.url.trim() !== '') {
      return banner.url
    }
    return ROUTE.CLIENT_MENU
  }

  // Helper function để kiểm tra URL có phải external không
  const isExternalUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://')
  }

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

        const linkUrl = getBannerLink(banner)
        const isExternal = isExternalUrl(linkUrl)

        const BannerContent = (
          <div className="flex overflow-hidden relative justify-center items-center w-full h-full">
            {/* Ảnh nền mờ + scale */}
            <img
              src={bgImage}
              alt="blurred background"
              className="object-cover absolute top-0 left-0 w-full h-full blur-md scale-110"
              aria-hidden="true"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.8)] via-transparent to-[rgba(255,255,255,0.8)] z-0" />

            {/* Ảnh chính */}
            <img
              src={bgImage}
              alt="main banner"
              className="object-contain relative z-10 max-w-full max-h-full"
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
        )

        return (
          <SwiperSlide key={index} className="flex justify-center items-center bg-black">
            {isExternal ? (
              <a
                href={linkUrl}
                className="block w-full h-full"
              >
                {BannerContent}
              </a>
            ) : (
              <Link to={linkUrl} className="block w-full h-full">
                {BannerContent}
              </Link>
            )}
          </SwiperSlide>
        )
      })}
    </Swiper>
  )
}
