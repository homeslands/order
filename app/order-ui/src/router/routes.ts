import {
  Banknote,
  Bolt,
  ChartColumn,
  ClipboardList,
  CookingPot,
  FileChartColumnIncreasing,
  FileText,
  Grid2x2,
  LayoutGrid,
  Newspaper,
  Phone,
  ShoppingBag,
  Store,
  Tag,
  Ticket,
  Users,
} from 'lucide-react'

import type { ISidebarRoute } from '@/types'
import { Role, ROUTE } from '@/constants'

export const sidebarRoutes: ISidebarRoute[] = [
  {
    title: 'sidebar.overview',
    path: ROUTE.OVERVIEW,
    roles: [Role.STAFF, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    icon: ChartColumn,
  },
  {
    title: 'sidebar.menu',
    path: ROUTE.STAFF_MENU,
    icon: LayoutGrid,
    roles: [Role.STAFF],
  },
  {
    title: 'sidebar.orderManagement',
    path: ROUTE.STAFF_ORDER_MANAGEMENT,
    roles: [Role.CHEF],
    icon: FileChartColumnIncreasing,
  },
  {
    title: 'sidebar.orderHistory',
    path: ROUTE.STAFF_ORDER_HISTORY,
    roles: [Role.STAFF, Role.MANAGER],
    icon: FileText,
  },
  {
    title: 'sidebar.tableManagement',
    path: ROUTE.STAFF_TABLE_MANAGEMENT,
    roles: [Role.MANAGER],
    icon: Grid2x2,
  },
  {
    title: 'sidebar.menuManagement',
    path: ROUTE.STAFF_MENU_MANAGEMENT,
    roles: [Role.CHEF, Role.MANAGER],
    icon: ClipboardList,
  },
  {
    title: 'sidebar.dishManagement',
    path: ROUTE.STAFF_PRODUCT_MANAGEMENT,
    roles: [Role.MANAGER],
    icon: CookingPot,
  },
  {
    title: 'sidebar.customerManagement',
    path: ROUTE.STAFF_CUSTOMER_MANAGEMENT,
    roles: [Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    icon: Users,
  },
  {
    title: 'sidebar.userManagement',
    path: ROUTE.STAFF_USER_MANAGEMENT,
    roles: [Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    icon: Users,
  },
  {
    title: 'sidebar.branchManagement',
    path: ROUTE.STAFF_BRANCH,
    roles: [Role.MANAGER],
    icon: Store,
  },

  {
    title: 'sidebar.staticPageManagement',
    path: ROUTE.STAFF_STATIC_PAGE,
    roles: [Role.MANAGER],
    icon: FileChartColumnIncreasing,
  },
  {
    title: 'sidebar.logManagement',
    path: ROUTE.STAFF_LOG_MANAGEMENT,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
    icon: FileChartColumnIncreasing,
  },
  {
    title: 'sidebar.bankConfig',
    path: ROUTE.STAFF_BANK_CONFIG,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
    icon: Banknote,
  },
  {
    title: 'sidebar.config',
    path: ROUTE.ADMIN_CONFIG,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
    icon: Bolt,
  },
  {
    title: 'sidebar.myOrders',
    path: ROUTE.CLIENT_ORDER_HISTORY,
    roles: [Role.CUSTOMER],
    icon: ShoppingBag,
  },
  {
    title: 'sidebar.aboutMe',
    path: ROUTE.ABOUT,
    roles: [Role.CUSTOMER],
    icon: FileText,
  },
  {
    title: 'sidebar.contact',
    path: ROUTE.CONTACT,
    roles: [Role.CUSTOMER],
    icon: Phone,
  },
  {
    title: 'sidebar.voucher',
    path: ROUTE.ADMIN_VOUCHER,
    roles: [Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    icon: Ticket,
  },
  {
    title: 'sidebar.promotion',
    path: ROUTE.ADMIN_PROMOTION,
    roles: [Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    icon: Tag,
  },
  {
    title: 'sidebar.banner',
    path: ROUTE.ADMIN_BANNER,
    roles: [Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
    icon: Newspaper,
  },
  // {
  //   title: 'sidebar.docs',
  //   path: ROUTE.DOCS,
  //   roles: [Role.CHEF, Role.STAFF, Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN],
  //   icon: BookText,
  // },
]
