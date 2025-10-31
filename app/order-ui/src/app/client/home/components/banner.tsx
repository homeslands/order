import React, { useState } from 'react'
// import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
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

  // Helper function để extract pathname từ URL
  const extractPathname = (url: string): string => {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname
    } catch {
      // Nếu không phải URL hợp lệ, coi như là pathname
      return url
    }
  }

  // Helper function để kiểm tra pathname có match với ROUTE constants không
  const matchesInternalRoute = (pathname: string): boolean => {
    const routeValues = Object.values(ROUTE)
    return routeValues.some((route) => {
      // Exact match hoặc starts with route + /
      return pathname === route || pathname.startsWith(route + '/')
    })
  }

  // Helper function để kiểm tra xem có phải internal route không
  const isInternalRoute = (url: string): boolean => {
    if (!url || url.trim() === '') return true

    // Nếu không phải http/https, coi như internal
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return true
    }

    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname

      // Ưu tiên check pathname có match với ROUTE không
      // Điều này quan trọng cho Capacitor app vì domain sẽ khác
      if (matchesInternalRoute(pathname)) {
        return true
      }

      // Nếu pathname không match, check domain
      const currentHost = window.location.host
      if (urlObj.host === currentHost) {
        return true
      }

      return false
    } catch {
      return true
    }
  }

  // Helper function để xác định URL đích
  const getBannerLink = (banner: IBanner): string => {
    if (banner.url && banner.url.trim() !== '') {
      // Nếu là internal route, extract pathname
      if (isInternalRoute(banner.url)) {
        return extractPathname(banner.url)
      }
      return banner.url
    }
    return ROUTE.CLIENT_MENU
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
      initialSlide={1}
      loop={true}
      speed={800}
      effect="slide"
      slidesPerView={1}
      spaceBetween={0}
      allowTouchMove={true}
      modules={[Autoplay, Pagination, Navigation]}
      className={`relative ${isMobile ? 'aspect-video' : 'h-[60vh]'} w-full`}
    >
      {bannerData?.map((banner, index) => {
        const bgImage = banner.image
          ? publicFileURL + '/' + banner.image
          : isMobile
            ? LandingPageBackgroundMobile
            : LandingPageBackground

        const linkUrl = getBannerLink(banner)
        const isInternal = isInternalRoute(banner.url || '')

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
            {isInternal ? (
              <Link to={linkUrl} className="block w-full h-full">
                {BannerContent}
              </Link>
            ) : (
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
              >
                {BannerContent}
              </a>
            )}
          </SwiperSlide>

          // <SwiperSlide
          //   key={index}
          //   className="flex justify-center items-center"
          //   style={{
          //     backgroundImage: `url(${isMobile ? LandingPageBackgroundMobile : bgImage})`,
          //   }}
          // >
          //   {/* Ẩn ảnh, chỉ dùng để kiểm soát load */}
          //   <div className="w-full h-[50vh] sm:h-[70vh] overflow-hidden">
          //     <img
          //       src={publicFileURL + '/' + banner.image}
          //       alt="banner"
          //       className="object-cover w-full h-full"
          //       onLoad={() => setIsImageLoaded(true)}
          //     />
          //   </div>

          //   <div className="hidden col-span-1 sm:block" />
          //   <motion.div
          //     className="col-span-2 mt-12 w-full text-center text-white sm:mt-0"
          //     initial={{ opacity: 0, scale: 0.9 }}
          //     animate={isImageLoaded ? { opacity: 1, scale: 1 } : {}}
          //     transition={{ duration: 0.8, ease: 'easeOut' }}
          //   >
          //     <div className="flex flex-col gap-2">
          //       <div className="text-4xl font-extrabold uppercase sm:text-4xl">
          //         {banner?.title ? banner.title : 'TREND Coffee'}
          //       </div>
          //     </div>
          //     <p className="mt-4 text-sm sm:text-base">
          //       {banner?.content
          //         ? banner.content.replace(/(<([^>]+)>)/gi, '').substring(0, 100)
          //         : 'Hương vị đẳng cấp, khơi nguồn cảm hứng cho mọi khoảnh khắc.'}
          //     </p>
          //     {banner?.useButtonUrl && isImageLoaded && (
          //       <div className="flex gap-4 justify-center mt-6 sm:flex-row">
          //         <Button
          //           variant="outline"
          //           className="text-white bg-transparent"
          //           onClick={() => window.open(banner.url)}
          //         >
          //           {t('banner.viewMore')}
          //         </Button>
          //       </div>
          //     )}
          //   </motion.div>
          //   <div className="hidden col-span-1 sm:block" />
          // </SwiperSlide>
        )
      })}
    </Swiper>
  )
}
