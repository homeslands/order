import {
  Archive,
  Banknote,
  Bolt,
  ChartColumn,
  ChefHat,
  ClipboardList,
  CookingPot,
  FileChartColumnIncreasing,
  Grid2x2,
  LayoutGrid,
  Newspaper,
  ShoppingCart,
  Store,
  Tag,
  Ticket,
  UserCog,
  Users,
} from 'lucide-react'

import type { ISidebarRoute } from '@/types'
import { ROUTE } from '@/constants'
import { Permission } from '@/constants/sidebar-permission'

export const sidebarRoutes: ISidebarRoute[] = [
  {
    title: 'sidebar.overview',
    path: ROUTE.OVERVIEW,
    permission: Permission.OVERVIEW,
    icon: ChartColumn,
  },
  {
    title: 'sidebar.menu',
    path: ROUTE.STAFF_MENU,
    icon: LayoutGrid,
    permission: Permission.STAFF_MENU,
  },
  {
    title: 'sidebar.orderManagement',
    path: ROUTE.STAFF_ORDER_MANAGEMENT,
    icon: ShoppingCart,
    permission: Permission.DELIVERY_MANAGEMENT,
  },
  {
    title: 'sidebar.chefOrderManagement',
    path: ROUTE.STAFF_CHEF_ORDER,
    icon: CookingPot,
    permission: Permission.CHEF_ORDER_MANAGEMENT,
  },
  {
    title: 'sidebar.orderHistory',
    path: ROUTE.STAFF_ORDER_HISTORY,
    icon: Archive,
    permission: Permission.ORDER_MANAGEMENT,
  },
  {
    title: 'sidebar.tableManagement',
    path: ROUTE.STAFF_TABLE_MANAGEMENT,
    icon: Grid2x2,
    permission: Permission.TABLE_MANAGEMENT,
  },
  {
    title: 'sidebar.menuManagement',
    path: ROUTE.STAFF_MENU_MANAGEMENT,
    icon: ClipboardList,
    permission: Permission.MENU_MANAGEMENT,
  },
  {
    title: 'sidebar.dishManagement',
    path: ROUTE.STAFF_PRODUCT_MANAGEMENT,
    icon: CookingPot,
    permission: Permission.PRODUCT_MANAGEMENT,
  },
  {
    title: 'sidebar.customerManagement',
    path: ROUTE.STAFF_CUSTOMER_MANAGEMENT,
    icon: Users,
    permission: Permission.CUSTOMER_MANAGEMENT,
  },
  {
    title: 'sidebar.userManagement',
    path: ROUTE.STAFF_USER_MANAGEMENT,
    icon: Users,
    permission: Permission.EMPLOYEE_MANAGEMENT,
  },
  {
    title: 'sidebar.branchManagement',
    path: ROUTE.STAFF_BRANCH,
    icon: Store,
    permission: Permission.BRANCH_MANAGEMENT,
  },
  {
    title: 'sidebar.roleManagement',
    path: ROUTE.STAFF_ROLE_MANAGEMENT,
    icon: UserCog,
    permission: Permission.ROLE_MANAGEMENT,
  },
  {
    title: 'sidebar.chefAreaManagement',
    path: ROUTE.STAFF_CHEF_AREA_MANAGEMENT,
    icon: ChefHat,
    permission: Permission.CHEF_AREA_MANAGEMENT,
  },
  {
    title: 'sidebar.staticPageManagement',
    path: ROUTE.STAFF_STATIC_PAGE,
    icon: FileChartColumnIncreasing,
    permission: Permission.PAGE_MANAGEMENT,
  },
  {
    title: 'sidebar.logManagement',
    path: ROUTE.STAFF_LOG_MANAGEMENT,
    icon: FileChartColumnIncreasing,
    permission: Permission.LOG_MANAGEMENT,
  },
  {
    title: 'sidebar.bankConfig',
    path: ROUTE.STAFF_BANK_CONFIG,
    icon: Banknote,
    permission: Permission.BANK_MANAGEMENT,
  },
  {
    title: 'sidebar.config',
    path: ROUTE.STAFF_CONFIG,
    icon: Bolt,
    permission: Permission.CONFIG_MANAGEMENT,
  },
  {
    title: 'sidebar.voucher',
    path: ROUTE.STAFF_VOUCHER,
    icon: Ticket,
    permission: Permission.VOUCHER_MANAGEMENT,
  },
  {
    title: 'sidebar.promotion',
    path: ROUTE.STAFF_PROMOTION,
    icon: Tag,
    permission: Permission.PROMOTION_MANAGEMENT,
  },
  {
    title: 'sidebar.banner',
    path: ROUTE.STAFF_BANNER,
    icon: Newspaper,
    permission: Permission.BANNER_MANAGEMENT,
  },
]
