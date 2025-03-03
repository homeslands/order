import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { useBanners, useProducts } from '@/hooks'
import { ROUTE } from '@/constants'
import { StoreCarousel } from './components'
import { AdPopup } from '@/components/app/AdPopup'
import SwiperBanner from './components/banner'
import SliderProduct from './components/slider-product'
export default function HomePage() {
  const { t } = useTranslation('home')
  const { data: banner } = useBanners()
  const bannerData = banner?.result || []
  // Animation Variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  const { data: products, isFetching } = useProducts({})
  const bestSellerProducts = products?.result?.filter(product => product.isTopSell) || []
  const newProducts = products?.result?.filter(product => product.isNew) || []

  return (
    <React.Fragment>
      <AdPopup />
      <div className="flex flex-col gap-6">
        {/* Section 1: Hero - Full width */}
        <SwiperBanner bannerData={bannerData} />

        {/* Section 2: Sản phẩm bán chạy */}
        {bestSellerProducts.length > 0 &&
          <div className="container">
            <motion.div
              className="flex flex-col items-start w-full gap-4 h-[20rem]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInVariants}
            >
              <div className="w-full flex-between">
                <div className="primary-highlight">
                  {t('home.bestSeller')}
                </div>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <Button>
                    {t('home.viewMore')}
                  </Button>
                </NavLink>
              </div>
              <SliderProduct products={bestSellerProducts} isFetching={isFetching} />
            </motion.div>
          </div>
        }


        {/* Section 2: Sản phẩm mới */}
        {newProducts.length > 0 &&
          <div className="container">
            <motion.div
              className="flex flex-col items-start w-full h-[20rem] gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInVariants}
            >
              <div className="w-full mb-4 flex-between">
                <div className="primary-highlight">
                  {t('home.newProduct')}
                </div>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <Button>
                    {t('home.viewMore')}
                  </Button>
                </NavLink>
              </div>
              <SliderProduct products={newProducts} isFetching={isFetching} />
            </motion.div>
          </div>
        }


        {/* Section 3: Info */}
        <div className="container">
          <motion.div
            className="grid items-start w-full grid-cols-1 gap-4 p-4 sm:grid-cols-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInVariants}
          >
            <div className="flex justify-center sm:col-span-2">
              <div className="flex flex-col items-start gap-4 sm:w-2/3">
                <div className="flex flex-col gap-2">
                  <span className="text-2xl font-extrabold">HOMELAND Coffee</span>
                  <span className="text-muted-foreground">
                    {t('home.homeDescription')}
                  </span>
                </div>
                <NavLink
                  to={ROUTE.CLIENT_MENU}
                  className="flex text-sm transition-all duration-200 rounded-md hover:scale-105 hover:bg-primary/20"
                >
                  <Button>
                    {t('home.learnMore')}
                  </Button>
                </NavLink>
              </div>
            </div>
            <div className="flex justify-center sm:col-span-3">
              <div className="w-full">
                <StoreCarousel />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 4: More info */}
        <motion.div
          className="flex items-center px-4 text-white bg-gray-900 h-96 sm:justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold sm:text-4xl">
              {t('home.learnAboutUs')}
            </h2>
            <p className="mt-4 text-sm">
              {t('home.aboutUsDescription')}
            </p>
            <Button className="mt-6">
              {t('home.contactUs')}
            </Button>
          </div>
        </motion.div>
      </div>
    </React.Fragment>
  )
}
