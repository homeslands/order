import React, { useState } from 'react'
// import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
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
  const [, setIsImageLoaded] = useState(false)

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

        return (
          <SwiperSlide key={index} className="flex justify-center items-center bg-black">
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
