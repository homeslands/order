import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enToast from '@/locales/en/toast.json'
import enAuth from '@/locales/en/auth.json'
import enCommon from '@/locales/en/common.json'
import enSidebar from '@/locales/en/sidebar.json'
import enMenu from '@/locales/en/menu.json'
import enSetting from '@/locales/en/setting.json'
import enProduct from '@/locales/en/product.json'
import enLog from '@/locales/en/log.json'
import enProfile from '@/locales/en/profile.json'
import enTable from '@/locales/en/table.json'
import enBank from '@/locales/en/bank.json'
import enRoute from '@/locales/en/route.json'
import enProgress from '@/locales/en/progress.json'
import enUser from '@/locales/en/user.json'
import enConfig from '@/locales/en/config.json'
import enRevenue from '@/locales/en/revenue.json'
import enBranch from '@/locales/en/branch.json'
import enStaticPage from '@/locales/en/static-page.json'
import enDashboard from '@/locales/en/dashboard.json'
import enEmployee from '@/locales/en/employee.json'
import enHelmet from '@/locales/en/helmet.json'
import enDoc from '@/locales/en/doc.json'
import enVoucher from '@/locales/en/voucher.json'
import enPromotion from '@/locales/en/promotion.json'
import enRole from '@/locales/en/role.json'
import enBanner from '@/locales/en/banner.json'
import enHome from '@/locales/en/home.json'
import enAbout from '@/locales/en/about.json'
import enChefArea from '@/locales/en/chef-area.json'
import enNotification from '@/locales/en/notification.json'
import enGiftCard from '@/locales/en/gift-card.json'

import viToast from '@/locales/vi/toast.json'
import viAuth from '@/locales/vi/auth.json'
import viCommon from '@/locales/vi/common.json'
import viSidebar from '@/locales/vi/sidebar.json'
import viMenu from '@/locales/vi/menu.json'
import viSetting from '@/locales/vi/setting.json'
import viProduct from '@/locales/vi/product.json'
import viLog from '@/locales/vi/log.json'
import viProfile from '@/locales/vi/profile.json'
import viTable from '@/locales/vi/table.json'
import viBank from '@/locales/vi/bank.json'
import viRoute from '@/locales/vi/route.json'
import viProgress from '@/locales/vi/progress.json'
import viUser from '@/locales/vi/user.json'
import viConfig from '@/locales/vi/config.json'
import viRevenue from '@/locales/vi/revenue.json'
import viBranch from '@/locales/vi/branch.json'
import viStaticPage from '@/locales/vi/static-page.json'
import viCustomer from '@/locales/vi/customer.json'
import viDashboard from '@/locales/vi/dashboard.json'
import viEmployee from '@/locales/vi/employee.json'
import viHelmet from '@/locales/vi/helmet.json'
import viDoc from '@/locales/vi/doc.json'
import viVoucher from '@/locales/vi/voucher.json'
import viPromotion from '@/locales/vi/promotion.json'
import viRole from '@/locales/vi/role.json'
import viBanner from '@/locales/vi/banner.json'
import viHome from '@/locales/vi/home.json'
import viAbout from '@/locales/vi/about.json'
import viChefArea from '@/locales/vi/chef-area.json'
import viNotification from '@/locales/vi/notification.json'
import viGiftCard from '@/locales/vi/gift-card.json'

i18n
  .use(LanguageDetector) // Tự động phát hiện ngôn ngữ
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        toast: enToast,
        auth: enAuth,
        common: enCommon,
        sidebar: enSidebar,
        menu: enMenu,
        setting: enSetting,
        product: enProduct,
        log: enLog,
        profile: enProfile,
        table: enTable,
        bank: enBank,
        route: enRoute,
        progress: enProgress,
        user: enUser,
        config: enConfig,
        revenue: enRevenue,
        branch: enBranch,
        staticPage: enStaticPage,
        dashboard: enDashboard,
        employee: enEmployee,
        helmet: enHelmet,
        doc: enDoc,
        voucher: enVoucher,
        promotion: enPromotion,
        role: enRole,
        banner: enBanner,
        home: enHome,
        about: enAbout,
        chefArea: enChefArea,
        notification: enNotification,
        giftCard: enGiftCard,
      },
      vi: {
        toast: viToast,
        auth: viAuth,
        common: viCommon,
        sidebar: viSidebar,
        menu: viMenu,
        setting: viSetting,
        product: viProduct,
        log: viLog,
        profile: viProfile,
        table: viTable,
        bank: viBank,
        route: viRoute,
        progress: viProgress,
        user: viUser,
        config: viConfig,
        revenue: viRevenue,
        branch: viBranch,
        staticPage: viStaticPage,
        customer: viCustomer,
        dashboard: viDashboard,
        employee: viEmployee,
        helmet: viHelmet,
        doc: viDoc,
        voucher: viVoucher,
        promotion: viPromotion,
        role: viRole,
        banner: viBanner,
        home: viHome,
        about: viAbout,
        chefArea: viChefArea,
        notification: viNotification,
        giftCard: viGiftCard,
      },
    },
    lng: window.localStorage.getItem('i18nextLng') || 'vi',
    fallbackLng: 'vi', // Ngôn ngữ mặc định
    interpolation: {
      escapeValue: false, // React đã tự động bảo vệ trước XSS
    },
    //Setup type-safe translation
    ns: [
      'toast',
      'auth',
      'common',
      'sidebar',
      'menu',
      'setting',
      'product',
      'log',
      'profile',
      'table',
      'bank',
      'route',
      'progress',
      'user',
      'config',
      'revenue',
      'branch',
      'staticPage',
      'dashboard',
      'employee',
      'helmet',
      'doc',
      'voucher',
      'promotion',
      'role',
      'banner',
      'home',
      'about',
      'chefArea',
      'notification',
      'giftCard',
    ], //Dùng để phân biệt các phần khác nhau của app
    defaultNS: 'auth', //Ngôn ngữ mặc định
  })

export default i18n
