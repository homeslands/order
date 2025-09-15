import { useMemo } from 'react'
import moment from 'moment'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'

import { Button } from '@/components/ui'
import { useBanners, useIsMobile, usePublicSpecificMenu, useSpecificMenu } from '@/hooks'
import { ROUTE, youtubeVideoId } from '@/constants'
import { SliderMenu, StoreCarousel, SwiperBanner, YouTubeVideoSection } from './components'
// import { AdPopup } from '@/components/app/AdPopup'
import { useBranchStore, useUserStore } from '@/stores'
import { IMenuItem } from '@/types'

// Animation Variants
const fadeInVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

export default function HomePage() {
  const { t } = useTranslation('home')
  const { t: tHelmet } = useTranslation('helmet')
  const isMobile = useIsMobile()
  const { branch } = useBranchStore()
  const { userInfo } = useUserStore()
  const { data: banner } = useBanners({ isActive: true })
  const { data: specificMenu, isFetching: isFetchingSpecificMenu } = useSpecificMenu(
    {
      date: moment().format('YYYY-MM-DD'),
      branch: branch ? branch?.slug : '',
    },
    !!userInfo?.slug
  )

  const { data: publicSpecificMenu, isFetching: isFetchingPublicSpecificMenu } = usePublicSpecificMenu(
    {
      date: moment().format('YYYY-MM-DD'),
      branch: branch ? branch?.slug : '',
    },
    !!userInfo?.slug === false
  )

  //get banner data
  const bannerData = useMemo(() => banner?.result || [], [banner])
  //get menu items available
  const menuItemsAvailable = useMemo(() => (userInfo?.slug ? specificMenu?.result?.menuItems || [] : publicSpecificMenu?.result?.menuItems || []).filter((item) => {
    const isAvailable = item.product.isLimit ? item.currentStock > 0 : true
    return !item.isLocked && isAvailable
  }), [specificMenu, publicSpecificMenu, userInfo?.slug])
  // get explore menu items
  const exploreMenuItems = useMemo(() => menuItemsAvailable.slice(0, 5), [menuItemsAvailable])
  // get best seller Items
  const bestSellerItems = useMemo(() => menuItemsAvailable.filter((item) => item.product.isTopSell)
    .sort((a, b) => b.product.saleQuantityHistory - a.product.saleQuantityHistory)
    .slice(0, 5)
    , [menuItemsAvailable])
  // get news items & promotion items
  const { newsProducts, promotionProducts } = useMemo(() => menuItemsAvailable.reduce(
    (
      acc: { newsProducts: IMenuItem[]; promotionProducts: IMenuItem[] },
      item: IMenuItem,
    ) => {
      if (item.product.isNew) acc.newsProducts.push(item)
      if (item.promotion) acc.promotionProducts.push(item)
      return acc
    },
    { newsProducts: [], promotionProducts: [] })
    , [menuItemsAvailable])

  return (
    <>
      {/* <AdPopup /> */}
      <Helmet>
        <meta charSet="utf-8" />
        <title>{tHelmet('helmet.home.title')}</title>
        <meta name="description" content={tHelmet('helmet.home.title')} />
      </Helmet>

      <div className="flex flex-col gap-6">
        {/* Section 1: Hero - Full width */}
        <SwiperBanner bannerData={bannerData} />

        {/* Section Menu Highlight */}
        {exploreMenuItems.length > 0 && (
          <div className="container">
            <motion.div
              className={`flex w-full flex-col items-start gap-4 ${isMobile ? 'h-[18rem]' : 'h-[24rem]'}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeInVariants}
            >
              <div className="w-full flex-between">
                <div className="primary-highlight">
                  {t('home.exploreMenu')}
                </div>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <Button>{t('home.viewMenu')}</Button>
                </NavLink>
              </div>
              <SliderMenu
                type="highlight"
                menus={exploreMenuItems}
                isFetching={false}
              />
            </motion.div>
          </div>
        )}

        {/* promotion */}
        {promotionProducts.length > 0 && (
          <div className="container">
            <motion.div
              className={`flex w-full flex-col items-start gap-4 ${isMobile ? 'h-[18rem]' : 'h-[24rem]'}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeInVariants}
            >
              <div className="w-full flex-between">
                <div className="primary-highlight">
                  {t('home.topPromotion')}
                </div>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <Button>{t('home.viewMore')}</Button>
                </NavLink>
              </div>
              <SliderMenu
                type="promotion"
                menus={promotionProducts}
                isFetching={isFetchingSpecificMenu || isFetchingPublicSpecificMenu}
              />
            </motion.div>
          </div>
        )}

        {/* Section Top sell */}
        {bestSellerItems.length > 0 && (
          <div className="container">
            <motion.div
              className={`flex w-full flex-col items-start gap-4 ${isMobile ? 'h-[18rem]' : 'h-[24rem]'}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInVariants}
            >
              <div className="w-full flex-between">
                <div className="primary-highlight">{t('home.bestSeller')}</div>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <Button>{t('home.viewMore')}</Button>
                </NavLink>
              </div>
              <SliderMenu
                menus={bestSellerItems}
                isFetching={isFetchingSpecificMenu || isFetchingPublicSpecificMenu}
                type="best-sell"
              />
            </motion.div>
          </div>
        )}

        {/* Section New products */}
        {newsProducts.length > 0 && (
          <div className="container">
            <motion.div
              className={`flex w-full flex-col items-start gap-4 ${isMobile ? 'h-[18rem]' : 'h-[24rem]'}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInVariants}
            >
              <div className="w-full flex-between">
                <div className="primary-highlight">{t('home.newProduct')}</div>
                <NavLink to={ROUTE.CLIENT_MENU}>
                  <Button>{t('home.viewMore')}</Button>
                </NavLink>
              </div>

              <SliderMenu menus={newsProducts} isFetching={isFetchingSpecificMenu || isFetchingPublicSpecificMenu} type="new" />
            </motion.div>
          </div>
        )}

        {/* Section  Info */}
        <div className="container">
          <motion.div
            className="grid grid-cols-1 gap-4 items-start py-4 w-full sm:grid-cols-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInVariants}
          >
            <div className="flex justify-center items-center h-full sm:col-span-2">
              <div className="flex flex-col gap-6 items-start sm:w-2/3">
                <div className="flex flex-col gap-2">
                  <span className="text-3xl font-extrabold text-primary">TREND Coffee</span>
                  <span className="text-muted-foreground">
                    {t('home.homeDescription')}
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>{t('home.homeDescription2')}</li>
                  <li>{t('home.homeDescription3')}</li>
                </ul>
              </div>
            </div>

            <div className="flex overflow-hidden relative justify-center sm:col-span-3">
              {['tl', 'tr', 'bl', 'br'].map((pos) => (
                <div
                  key={pos}
                  className={`
                    absolute w-12 h-12 border-2 border-primary
                    ${pos === 'tl' && 'top-0 left-0 rounded-tl-3xl border-r-0 border-b-0'}
                    ${pos === 'tr' && 'top-0 right-0 rounded-tr-3xl border-l-0 border-b-0'}
                    ${pos === 'bl' && 'bottom-0 left-0 rounded-bl-3xl border-r-0 border-t-0'}
                    ${pos === 'br' && 'bottom-0 right-0 rounded-br-3xl border-l-0 border-t-0'}
                  `}
                  style={{ zIndex: 10 }}
                />
              ))}
              <div className="p-3 w-full">
                <StoreCarousel />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section Video YouTube */}
        <YouTubeVideoSection
          videoId={youtubeVideoId}
          title={t('home.videoSection.title', 'Khám phá câu chuyện TREND Coffee')}
          description={t('home.videoSection.description', 'Tìm hiểu về hành trình và giá trị mà chúng tôi mang đến cho khách hàng')}
        />

        {/* Section More info */}
        {/* <motion.div
          className="flex items-center px-4 h-96 text-white bg-gray-900 sm:justify-center"
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
        </motion.div> */}
      </div>
    </>
  )
}
