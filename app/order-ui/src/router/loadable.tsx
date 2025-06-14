import React from 'react'

// Layout
export const SystemLayout = React.lazy(() =>
  import('@/app/layouts/system').then((module) => ({
    default: module.SystemLayout,
  })),
)

export const ClientViewLayout = React.lazy(() =>
  import('@/app/layouts/system').then((module) => ({
    default: module.ClientViewLayout,
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

export const OrderSuccessPage = React.lazy(() =>
  import('@/app/system/menu').then((module) => ({
    default: module.OrderSuccessPage,
  })),
)

export const ClientOrderSuccessPage = React.lazy(() =>
  import('@/app/client/payment/components').then((module) => ({
    default: module.ClientOrderSuccessPage,
  })),
)

export const GiftCardSuccessPage = React.lazy(() =>
  import('@/app/client/gift-card/checkout/success').then((module) => ({
    default: module.GiftCardSuccessPage,
  })),
)

//Order management page
export const OrderManagementPage = React.lazy(() =>
  import('@/app/system/order-management').then((module) => ({
    default: module.OrderManagementPage,
  })),
)

//Client view page
export const ClientViewPage = React.lazy(() =>
  import('@/app/system/client-view').then((module) => ({
    default: module.ClientViewPage,
  })),
)
// Chef order management page
export const ChefOrderPage = React.lazy(() =>
  import('@/app/system/chef-order').then((module) => ({
    default: module.ChefOrderPage,
  })),
)

//Order history page
export const OrderHistoryPage = React.lazy(() =>
  import('@/app/system/order-history').then((module) => ({
    default: module.OrderHistoryPage,
  })),
)

//Order public page
export const OrdersPublicPage = React.lazy(() =>
  import('@/app/client/orders-public').then((module) => ({
    default: module.OrdersPublicPage,
  })),
)

//Order public detail page
export const PublicOrderDetailPage = React.lazy(() =>
  import('@/app/client/public-order-detail').then((module) => ({
    default: module.PublicOrderDetailPage,
  })),
)
//Update order page for staff
export const UpdateOrderPage = React.lazy(() =>
  import('@/app/system/update-order').then((module) => ({
    default: module.UpdateOrderPage,
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

export const MenuDetailManagementPage = React.lazy(() =>
  import('@/app/system/menu-detail-management').then((module) => ({
    default: module.MenuDetailManagementPage,
  })),
)

export const ProductDetailPage = React.lazy(() =>
  import('@/app/system/dishes').then((module) => ({
    default: module.ProductDetail,
  })),
)

//User list page
export const EmployeeListPage = React.lazy(() =>
  import('@/app/system/users').then((module) => ({
    default: module.EmployeeListPage,
  })),
)

export const CustomerPage = React.lazy(() =>
  import('@/app/system/customers').then((module) => ({
    default: module.CustomerPage,
  })),
)

// Role page
export const RolePage = React.lazy(() =>
  import('@/app/system/role').then((module) => ({
    default: module.RolePage,
  })),
)

// Role detail page
export const RoleDetailPage = React.lazy(() =>
  import('@/app/system/role').then((module) => ({
    default: module.RoleDetailPage,
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

//Static page detail page
export const StaticPageDetailPage = React.lazy(() =>
  import('@/app/system/static-page').then((module) => ({
    default: module.StaticPageDetailPage,
  })),
)

//Config page
export const ConfigPage = React.lazy(() =>
  import('@/app/system/config').then((module) => ({
    default: module.ConfigPage,
  })),
)

//Voucher group page
export const VoucherGroupPage = React.lazy(() =>
  import('@/app/system/voucher').then((module) => ({
    default: module.VoucherGroupPage,
  })),
)
export const VoucherPage = React.lazy(() =>
  import('@/app/system/voucher/components').then((module) => ({
    default: module.VoucherPage,
  })),
)

export const PromotionPage = React.lazy(() =>
  import('@/app/system/promotion').then((module) => ({
    default: module.PromotionPage,
  })),
)

export const ChefAreaPage = React.lazy(() =>
  import('@/app/system/chef-area').then((module) => ({
    default: module.ChefAreaPage,
  })),
)

export const ChefAreaDetailPage = React.lazy(() =>
  import('@/app/system/chef-area').then((module) => ({
    default: module.ChefAreaDetailPage,
  })),
)

export const DocsPage = React.lazy(() =>
  import('@/app/system/docs').then((module) => ({
    default: module.DocsPage,
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
    default: module.CartPage,
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

//Update order page
export const ClientUpdateOrderPage = React.lazy(() =>
  import('@/app/client/update-order').then((module) => ({
    default: module.ClientUpdateOrderPage,
  })),
)

//About page
export const ClientAboutPage = React.lazy(() =>
  import('@/app/client/about').then((module) => ({
    default: module.AboutPage,
  })),
)

//Policy page
export const ClientPolicyPage = React.lazy(() =>
  import('@/app/client/policy').then((module) => ({
    default: module.PolicyPage,
  })),
)

//Security term page
export const ClientSecurityTermPage = React.lazy(() =>
  import('@/app/client/security-term').then((module) => ({
    default: module.SecurityTermPage,
  })),
)

//Banner page
export const BannerPage = React.lazy(() =>
  import('@/app/system/banner').then((module) => ({
    default: module.BannerPage,
  })),
)

//Voucher and promotion page
// export const VoucherAndPromotionPage = React.lazy(() =>
//   import('@/app/client/voucher-promotion').then((module) => ({
//     default: module.VoucherAndPromotionPage,
//   })),
// )

//Gift card page
export const GiftCardPage = React.lazy(() =>
  import('@/app/system/gift-card').then((module) => ({
    default: module.GiftCardPage,
  })),
)

//Client Gift card page
export const ClientGiftCardPage = React.lazy(() =>
  import('@/app/client/gift-card').then((module) => ({
    default: module.ClientGiftCardPage,
  })),
)

//Client Gift card checkout page
export const ClientGiftCardCheckoutPage = React.lazy(() =>
  import('@/app/client/gift-card/checkout').then((module) => ({
    default: module.GiftCardCheckoutPage,
  })),
)

//Client Gift card checkout with slug page
export const ClientGiftCardCheckoutWithSlugPage = React.lazy(() =>
  import('@/app/client/gift-card/checkout/[slug]').then((module) => ({
    default: module.GiftCardCheckoutPageBySlug,
  })),
)
