import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui'
import { useBanners, useSpecificMenu } from '@/hooks'
import { ROUTE } from '@/constants'
import {
  SliderMenu,
  StoreCarousel,
  SwiperBanner,
} from './components'
import { AdPopup } from '@/components/app/AdPopup'
import { Helmet } from 'react-helmet'
import moment from 'moment'
import { useBranchStore } from '@/stores'
import { IMenuItem } from '@/types'

export default function HomePage() {
  const { t } = useTranslation('home')
  const { t: tHelmet } = useTranslation('helmet')
  const { data: banner } = useBanners({ isActive: true })
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
  const { branch } = useBranchStore()
  const { data: specificMenu, isFetching: fechMenupromotion } = useSpecificMenu(
    {
      date: moment().format('YYYY-MM-DD'),
      branch: branch ? branch?.slug : '',
    },
  )
  const customMenu = (specificMenu?.result?.menuItems || []).filter((item) => {
    const isAvailable = item.product.isLimit ? item.currentStock > 0 : true;
    return !item.isLocked && isAvailable;
  })

  const sortedMenuItems = customMenu.sort((a, b) => b.product.saleQuantityHistory - a.product.saleQuantityHistory);
  // Lấy top  sản phẩm có doanh số cao nhất
  const top15BestSellers = sortedMenuItems.slice(0, 10);

  // Lọc ra các sản phẩm có `isTopSell` chưa có trong `topBestSellers`
  const topSellProducts = sortedMenuItems.filter(
    (item) => item.product.isTopSell && !top15BestSellers.includes(item)
  );

  // Gộp danh sách lại
  const bestSellerProducts = [...top15BestSellers, ...topSellProducts];

  // Lọc sản phẩm mới và có khuyến mãi
  const { newsProducts, promotionProducts } = customMenu.reduce(
    (acc: { newsProducts: IMenuItem[], promotionProducts: IMenuItem[] }, item: IMenuItem) => {
      if (item.product.isNew) acc.newsProducts.push(item);
      if (item.promotion) acc.promotionProducts.push(item);
      return acc;
    },
    { newsProducts: [], promotionProducts: [] }
  );

  return (
    <React.Fragment>
      <AdPopup />
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.home.title')}</title>
        <meta name="description" content={tHelmet('helmet.home.title')} />
      </Helmet>

      <div className="flex flex-col gap-6">
        {/* Section 1: Hero - Full width */}
        <SwiperBanner bannerData={bannerData} />

        {/* promotion */}
        {promotionProducts.length > 0 && (
          <div className="container">
            <motion.div
              className="flex h-[28rem] w-full flex-col items-start gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeInVariants}
            >
              <div className="flex-between w-full">
                <div className="primary-highlight">
                  {t('home.topPromotion')}
                </div>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <Button>{t('home.viewMore')}</Button>
                </NavLink>
              </div>
              <SliderMenu
                menus={promotionProducts}
                isFetching={fechMenupromotion}
              />
            </motion.div>
          </div>
        )}

        {/* Section Top sell */}
        {bestSellerProducts.length > 0 && (
          <div className="container">
            <motion.div
              className="flex min-h-[28rem] h-fit w-full flex-col items-start gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInVariants}
            >
              <div className="flex-between w-full">
                <div className="primary-highlight">{t('home.bestSeller')}</div>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <Button>{t('home.viewMore')}</Button>
                </NavLink>
              </div>
              <SliderMenu
                menus={bestSellerProducts}
                isFetching={fechMenupromotion}
                type='best-sell'
              />
            </motion.div>
          </div>
        )}

        {/* Section New products */}
        {newsProducts.length > 0 && (
          <div className="container">
            <motion.div
              className="flex h-[28rem] w-full flex-col items-start gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInVariants}
            >
              <div className="flex-between w-full">
                <div className="primary-highlight">{t('home.newProduct')}</div>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <Button>{t('home.viewMore')}</Button>
                </NavLink>
              </div>
              {/* <SliderProduct products={newProducts} isFetching={isFetching} /> */}
              <SliderMenu
                menus={newsProducts}
                isFetching={fechMenupromotion}
              />
            </motion.div>
          </div>
        )}

        {/* Section  Info */}
        <div className="container">
          <motion.div
            className="grid w-full grid-cols-1 items-start gap-4 p-4 sm:grid-cols-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInVariants}
          >
            <div className="flex justify-center sm:col-span-2">
              <div className="flex flex-col items-start gap-4 sm:w-2/3">
                <div className="flex flex-col gap-2">
                  <span className="text-2xl font-extrabold">
                    HOMELAND Coffee
                  </span>
                  <span className="text-muted-foreground">
                    {t('home.homeDescription')}
                  </span>
                </div>
                <NavLink
                  to={ROUTE.CLIENT_MENU}
                  className="flex rounded-md text-sm transition-all duration-200 hover:scale-105 hover:bg-primary/20"
                >
                  <Button>{t('home.learnMore')}</Button>
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

        {/* Section More info */}
        <motion.div
          className="flex h-96 items-center bg-gray-900 px-4 text-white sm:justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold sm:text-4xl">
              {t('home.learnAboutUs')}
            </h2>
            <p className="mt-4 text-sm">{t('home.aboutUsDescription')}</p>
            <Button className="mt-6">{t('home.contactUs')}</Button>
          </div>
        </motion.div>
      </div>
    </React.Fragment>
  )
}
