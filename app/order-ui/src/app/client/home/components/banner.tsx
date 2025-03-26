import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import {
  LandingPageBackground,
  LandingPageBackgroundMobile,
} from '@/assets/images'
import { useIsMobile } from '@/hooks'
import React, { useState } from 'react'
import { IBanner } from '@/types'
import { publicFileURL } from '@/constants/env'
import { Button } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
export default function SwiperBanner({
  bannerData,
}: {
  bannerData: IBanner[]
}): React.ReactElement {
  const isMobile = useIsMobile()
  const { t } = useTranslation(['banner'])
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  return (
    <Swiper
      pagination={{
        dynamicBullets: true,
        clickable: true,
      }}
      initialSlide={1}
      modules={[Autoplay, Pagination, Navigation]}
      className="relative h-[70vh] w-full"
    >
      {bannerData?.map((banner, index) => {
        const bgImage = banner.image ? publicFileURL + '/' + banner.image : LandingPageBackground
        return (
          <SwiperSlide
            key={index}
            className="grid h-[95%] w-full grid-cols-1 justify-center bg-cover bg-center px-4 sm:grid-cols-6 sm:items-center sm:px-0"
            style={{
              backgroundImage: `url(${isMobile ? LandingPageBackgroundMobile : bgImage})`,
            }}
          >
            {/* Ẩn ảnh, chỉ dùng để kiểm soát load */}
            <img
              src={bgImage}
              alt="banner"
              className="hidden"
              onLoad={() => setIsImageLoaded(true)}
            />

            <div className="hidden col-span-1 sm:block" />
            <motion.div
              className="w-full col-span-2 mt-12 text-center text-white sm:mt-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isImageLoaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="flex flex-col gap-2">
                <div className="text-4xl font-extrabold uppercase sm:text-4xl">
                  {banner?.title ? banner.title : 'TREND Coffee'}
                </div>
              </div>
              <p className="mt-4 text-sm sm:text-base">
                {banner?.content
                  ? banner.content.replace(/(<([^>]+)>)/gi, '').substring(0, 100)
                  : 'Hương vị đẳng cấp, khơi nguồn cảm hứng cho mọi khoảnh khắc.'}
              </p>
              {banner?.useButtonUrl && isImageLoaded && (
                <div className="flex justify-center gap-4 mt-6 sm:flex-row">
                  <Button
                    variant="outline"
                    className="text-white bg-transparent"
                    onClick={() => window.open(banner.url)}
                  >
                    {t('banner.viewMore')}
                  </Button>
                </div>
              )}
            </motion.div>
            <div className="hidden col-span-1 sm:block" />
          </SwiperSlide>
        )
      })}
    </Swiper>
  )
}
