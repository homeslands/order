import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FacebookIcon, YoutubeIcon } from 'lucide-react'

import { HomelandLogo, Store1 } from '@/assets/images'
import { ROUTE } from '@/constants'

export function ClientFooter() {
  const { t } = useTranslation('sidebar')
  return (
    <footer className="text-white bg-primary">
      <div className="container py-6">
        <div className="grid items-start grid-cols-2 gap-5 lg:grid-cols-4">
          <div className="flex flex-col items-start justify-center gap-2 w-fit">
            <span className="font-bold">
              {t('footer.quickLink')}
            </span>
            <NavLink
              to={ROUTE.HOME}
              className="text-xs cursor-pointer hover:underline"
            >
              {t('footer.home')}
            </NavLink>
            <NavLink
              to={ROUTE.CLIENT_MENU}
              className="text-xs cursor-pointer hover:underline"
            >
              {t('footer.menu')}
            </NavLink>
          </div>
          <div className="flex flex-col items-start justify-center gap-2 w-fit">
            <span className="font-bold">
              {t('footer.introduction')}
            </span>
            <span className="text-sm">
              {t('footer.menu')}
            </span>
            <span className="text-sm">
              {t('footer.product')}
            </span>
            <span className="text-sm">
              {t('footer.offer')}
            </span>
            <span className="text-sm">
              {t('footer.store')}
            </span>
            <span className="text-sm">
              {t('footer.recruitment')}
            </span>
          </div>
          <div className="flex flex-col items-start justify-center gap-2 w-fit">
            <span className="font-bold">
              {t('footer.policy')}
            </span>
            <span className="text-sm">
              {t('footer.securityTerm')}
            </span>
            {/* <span className="text-sm">Chính sách bảo mật</span> */}
          </div>
          <div className="relative flex flex-col items-start justify-center col-span-1 gap-4">
            <div className="relative">
              <img
                src={Store1}
                alt="store"
                className="w-full h-40 rounded-sm"
              />
              <img
                src={HomelandLogo}
                alt="logo"
                className="absolute top-0 left-0 w-auto h-5 m-2" // Đặt Logo ở góc trên trái với margin
              />
            </div>
            <div className="flex gap-2">
              <NavLink
                to={`https://www.facebook.com/thangquyet0501/`}
                className="flex items-center justify-center px-2 text-xs transition-all duration-200 rounded-md hover:scale-105 hover:bg-primary/20 hover:text-primary sm:text-sm"
              >
                <FacebookIcon />
              </NavLink>
              <NavLink
                to={`https://www.youtube.com/@KhoaiLangThang`}
                className="flex items-center justify-center px-2 text-xs transition-all duration-200 rounded-md hover:scale-105 hover:bg-primary/20 hover:text-primary sm:text-sm"
              >
                <YoutubeIcon />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
