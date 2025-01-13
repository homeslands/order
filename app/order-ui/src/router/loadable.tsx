import React from 'react'

// Layout
export const SystemLayout = React.lazy(() =>
  import('@/app/layouts/system').then((module) => ({
    default: module.SystemLayout,
  })),
)

//Auth
export const LoginPage = React.lazy(() =>
  import('@/app/auth').then((module) => ({
    default: module.LoginPage,
  })),
)

export const RegisterPage = React.lazy(() =>
  import('@/app/auth').then((module) => ({
    default: module.RegisterPage,
  })),
)

export const ForgotPasswordPage = React.lazy(() =>
  import('@/app/auth').then((module) => ({
    default: module.ForgotPasswordPage,
  })),
)

export const ForgotPasswordAndResetPasswordPage = React.lazy(() =>
  import('@/app/auth').then((module) => ({
    default: module.ForgotPasswordAndResetPasswordPage,
  })),
)

//Views
//----------------------------------------------//
//Admin
//Home page
export const OverviewPage = React.lazy(() =>
  import('@/app/system/home').then((module) => ({
    default: module.OverviewPage,
  })),
)

export const OverviewDetailPage = React.lazy(() =>
  import('@/app/system/home').then((module) => ({
    default: module.OverviewDetailPage,
  })),
)

//Menu page
export const MenuPage = React.lazy(() =>
  import('@/app/system/menu').then((module) => ({
    default: module.MenuPage,
  })),
)
export const CartContent = React.lazy(() =>
  import('@/app/system/menu').then((module) => ({
    default: module.CartContent,
  })),
)

export const ConfirmOrderPage = React.lazy(() =>
  import('@/app/system/menu').then((module) => ({
    default: module.ConfirmOrderPage,
  })),
)

export const OrderSuccessPage = React.lazy(() =>
  import('@/app/system/menu').then((module) => ({
    default: module.OrderSuccessPage,
  })),
)

//Order management page
export const OrderManagementPage = React.lazy(() =>
  import('@/app/system/order-management').then((module) => ({
    default: module.OrderManagementPage,
  })),
)

//Order history page
export const OrderHistoryPage = React.lazy(() =>
  import('@/app/system/order-history').then((module) => ({
    default: module.OrderHistoryPage,
  })),
)

//Order detail page
export const OrderDetailPage = React.lazy(() =>
  import('@/app/system/order-history').then((module) => ({
    default: module.OrderDetailPage,
  })),
)

//Table page
export const TablePage = React.lazy(() =>
  import('@/app/system/table').then((module) => ({
    default: module.TablePage,
  })),
)

//Product page
export const ProductManagementPage = React.lazy(() =>
  import('@/app/system/dishes').then((module) => ({
    default: module.ProductManagementPage,
  })),
)

//Menu page
export const MenuManagementPage = React.lazy(() =>
  import('@/app/system/menu-management').then((module) => ({
    default: module.MenuManagementPage,
  })),
)

export const MenuDetailPage = React.lazy(() =>
  import('@/app/system/menu-management').then((module) => ({
    default: module.MenuDetailPage,
  })),
)

export const ProductDetailPage = React.lazy(() =>
  import('@/app/system/dishes').then((module) => ({
    default: module.ProductDetail,
  })),
)

//User list page
export const UserListPage = React.lazy(() =>
  import('@/app/system/users').then((module) => ({
    default: module.UserListPage,
  })),
)

export const CustomerPage = React.lazy(() =>
  import('@/app/system/customers').then((module) => ({
    default: module.CustomerPage,
  })),
)

//Branch page
export const BranchPage = React.lazy(() =>
  import('@/app/system/branch').then((module) => ({
    default: module.BranchManagementPage,
  })),
)

//Log page
export const LoggerPage = React.lazy(() =>
  import('@/app/system/logger').then((module) => ({
    default: module.LoggerPage,
  })),
)

//Profile page
export const ProfilePage = React.lazy(() =>
  import('@/app/system/profile').then((module) => ({
    default: module.ProfilePage,
  })),
)

//Order payment page
export const OrderPaymentPage = React.lazy(() =>
  import('@/app/system/payment').then((module) => ({
    default: module.PaymentPage,
  })),
)

//Revenue page
export const RevenuePage = React.lazy(() =>
  import('@/app/system/revenue').then((module) => ({
    default: module.RevenuePage,
  })),
)

//Bank config page
export const BankConfigPage = React.lazy(() =>
  import('@/app/system/payment').then((module) => ({
    default: module.BankConfigPage,
  })),
)

//Static page
export const StaticPageManagementPage = React.lazy(() =>
  import('@/app/system/static-page').then((module) => ({
    default: module.StaticPageManagementPage,
  })),
)

//Config page
export const ConfigPage = React.lazy(() =>
  import('@/app/system/config').then((module) => ({
    default: module.ConfigPage,
  })),
)

//----------------------------------------------//
//Client
//Home page
export const ClientHomePage = React.lazy(() =>
  import('@/app/client/home').then((module) => ({
    default: module.HomePage,
  })),
)

//Menu page
export const ClientMenuPage = React.lazy(() =>
  import('@/app/client/menu').then((module) => ({
    default: module.MenuPage,
  })),
)

//Product detail page
export const ClientProductDetailPage = React.lazy(() =>
  import('@/app/client/product-detail').then((module) => ({
    default: module.ProductDetail,
  })),
)

//Cart page
export const ClientCartPage = React.lazy(() =>
  import('@/app/client/cart').then((module) => ({
    default: module.ClientCartPage,
  })),
)

//Payment page
export const ClientPaymentPage = React.lazy(() =>
  import('@/app/client/payment').then((module) => ({
    default: module.ClientPaymentPage,
  })),
)

export const ClientOrderHistoryPage = React.lazy(() =>
  import('@/app/client/order-history').then((module) => ({
    default: module.OrderHistoryPage,
  })),
)

export const ClientProfilePage = React.lazy(() =>
  import('@/app/client/profile').then((module) => ({
    default: module.ProfilePage,
  })),
)
