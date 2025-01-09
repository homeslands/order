import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui'
import {
  LandingPageBackground,
  LandingPageBackgroundMobile,
} from '@/assets/images'
import { useIsMobile } from '@/hooks'
import { ROUTE } from '@/constants'
import { BestSellerCarousel, StoreCarousel } from '.'
import { AdPopup } from '@/components/app/AdPopup'

export default function HomePage() {
  const isMobile = useIsMobile()

  // Animation Variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <div className="flex flex-col w-full">
      <AdPopup />
      <div className="flex flex-col gap-6">
        {/* Section 1: Hero - Full width */}
        <motion.div
          className="relative grid min-h-[60vh] w-full grid-cols-1 justify-center bg-cover bg-center px-4 sm:grid-cols-6 sm:items-center sm:px-0"
          style={{
            backgroundImage: `url(${isMobile ? LandingPageBackgroundMobile : LandingPageBackground
              })`,
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInVariants}
        >
          <div className="hidden col-span-1 sm:block" />
          <div className="w-full col-span-2 mt-12 text-center text-white sm:mt-0">
            <div className="flex flex-col gap-2">
              <div className="text-4xl font-extrabold uppercase sm:text-5xl">
                TREND COFFEE
              </div>
            </div>
            <p className="mt-4 text-sm sm:text-base">
              Hương vị đẳng cấp, khơi nguồn cảm hứng cho mọi khoảnh khắc.
            </p>
            <div className="flex justify-center gap-4 mt-6 sm:flex-row">
              <NavLink to={ROUTE.CLIENT_MENU}>
                <Button className="w-full">Thực đơn</Button>
              </NavLink>
              <Button variant="outline" className="text-white bg-transparent">
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
          <div className="hidden col-span-1 sm:block" />
        </motion.div>

        {/* Section 2: Sản phẩm bán chạy */}
        <div className="container">
          <motion.div
            className="flex flex-col items-start w-full gap-4 h-fit"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeInVariants}
          >
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                <div className="px-3 py-1 text-xs text-white border rounded-full border-primary bg-primary text-muted-foreground sm:text-sm">
                  Sản phẩm bán chạy
                </div>
                <div className="px-3 py-1 text-xs border rounded-full text-muted-foreground sm:text-sm">
                  Sản phẩm mới
                </div>
              </div>
              <NavLink
                to={ROUTE.CLIENT_MENU}
                className="flex items-center justify-center px-2 text-xs transition-all duration-200 rounded-md hover:scale-105 hover:bg-primary/20 hover:text-primary sm:text-sm"
              >
                Xem thêm
              </NavLink>
            </div>
            <BestSellerCarousel
            // menu={specificMenu?.result}
            // isLoading={isLoading}
            />
          </motion.div>
        </div>

        {/* Section 3: Thông tin quán */}
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
                  <span className="text-3xl font-extrabold">TREND Coffee</span>
                  <span className="text-muted-foreground">
                    Không gian hiện đại, ấm cúng – nơi gắn kết những câu chuyện và tạo nên kỷ niệm khó quên.
                  </span>
                </div>
                <NavLink
                  to={ROUTE.CLIENT_MENU}
                  className="flex text-sm transition-all duration-200 rounded-md hover:scale-105 hover:bg-primary/20"
                >
                  <Button>Tìm hiểu thêm</Button>
                </NavLink>
              </div>
            </div>
            <div className="flex justify-center sm:col-span-3">
              <div className="w-full sm:w-11/12">
                <StoreCarousel />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section 4: Thông tin thêm */}
        <motion.div
          className="flex items-center px-4 text-white bg-gray-900 h-96 sm:justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-2xl font-bold sm:text-4xl">
              Tìm hiểu thêm về chúng tôi
            </h2>
            <p className="mt-4 text-sm">
              Chúng tôi cung cấp các loại cà phê chất lượng cao với nguồn gốc rõ
              ràng. Hãy ghé thăm cửa hàng của chúng tôi!
            </p>
            <Button className="mt-6">Liên hệ</Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
