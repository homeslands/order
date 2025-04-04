import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { SkeletonCart } from '@/components/app/skeleton'
import { SuspenseElement } from '@/components/app/elements'
import { ROUTE } from '@/constants'
import {
  MenuPage,
  SystemLayout,
  LoginPage,
  SystemCheckoutPage,
  TablePage,
  OrderSuccessPage,
  RegisterPage,
  ProductManagementPage,
  LoggerPage,
  ProductDetailPage,
  ProfilePage,
  MenuManagementPage,
  OrderPaymentPage,
  BankConfigPage,
  MenuDetailManagementPage,
  OrderManagementPage,
  OrderHistoryPage,
  OrderDetailPage,
  EmployeeListPage,
  ForgotPasswordPage,
  ConfigPage,
  ForgotPasswordAndResetPasswordPage,
  ClientMenuPage,
  ClientProductDetailPage,
  ClientHomePage,
  ClientCartPage,
  ClientOrderHistoryPage,
  ClientProfilePage,
  ClientPaymentPage,
  RevenuePage,
  StaticPageManagementPage,
  CustomerPage,
  OverviewDetailPage,
  ClientUpdateOrderPage,
  ClientAboutPage,
  ClientPolicyPage,
  StaticPageDetailPage,
  DocsPage,
  VoucherPage,
  PromotionPage,
  BannerPage,
  EmailVerificationPage,
  RolePage,
  RoleDetailPage,
  ChefAreaPage,
  ChefAreaDetailPage,
  ChefOrderPage,
} from './loadable'
import ProtectedElement from '@/components/app/elements/protected-element'
import { ClientLayout } from '@/app/layouts/client'
import { BranchManagementPage } from '@/app/system/branch'
import { DocsLayout } from '@/app/layouts/system'
import ErrorPage from '@/app/error-page'
import NotFoundPage from '@/app/not-found-page'

export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      { path: ROUTE.LOGIN, element: <SuspenseElement component={LoginPage} /> },
      {
        path: ROUTE.REGISTER,
        element: <SuspenseElement component={RegisterPage} />,
      },
      {
        path: ROUTE.FORGOT_PASSWORD,
        element: <SuspenseElement component={ForgotPasswordPage} />,
      },
      {
        path: `${ROUTE.RESET_PASSWORD}`,
        element: <SuspenseElement component={ForgotPasswordAndResetPasswordPage} />,
      },
      {
        path: ROUTE.VERIFY_EMAIL,
        element: <SuspenseElement component={EmailVerificationPage} />,
      },
      {
        path: ROUTE.ABOUT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <ClientLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <SuspenseElement component={ClientAboutPage} />,
          },
        ],
      },
      {
        path: ROUTE.POLICY,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <ClientLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <SuspenseElement component={ClientPolicyPage} />,
          },
        ],
      },
      {
        path: ROUTE.OVERVIEW,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                element={<SuspenseElement component={OverviewDetailPage} />}
              />
            ),
          },
        ],
      },
      // {
      //   path: ROUTE.OVERVIEW_DETAIL,
      //   element: (
      //     <Suspense fallback={<SkeletonCart />}>
      //       <SuspenseElement component={SystemLayout} />
      //     </Suspense>
      //   ),
      //   children: [
      //     {
      //       index: true,
      //       element: (
      //         <ProtectedElement
      //           // allowedRoles={[
      //           //   Role.CHEF,
      //           //   Role.STAFF,
      //           //   Role.MANAGER,
      //           //   Role.ADMIN,
      //           //   Role.SUPER_ADMIN,
      //           // ]}
      //           element={<SuspenseElement component={OverviewDetailPage} />}
      //         />
      //       ),
      //     },
      //   ],
      // },
      {
        path: ROUTE.STAFF_MENU,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.STAFF]}
                element={<SuspenseElement component={MenuPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_CHECKOUT_ORDER,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.STAFF]}
                element={<SuspenseElement component={SystemCheckoutPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.STAFF_ORDER_PAYMENT}`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[
                //   Role.STAFF,
                //   Role.MANAGER,
                //   Role.ADMIN,
                //   Role.SUPER_ADMIN,
                // ]}
                element={<SuspenseElement component={OrderPaymentPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.ORDER_SUCCESS}/:slug`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[
                //   Role.STAFF,
                //   Role.MANAGER,
                //   Role.ADMIN,
                //   Role.SUPER_ADMIN,
                // ]}
                element={<SuspenseElement component={OrderSuccessPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_ORDER_MANAGEMENT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                element={<SuspenseElement component={OrderManagementPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_CHEF_ORDER,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                element={<SuspenseElement component={ChefOrderPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_ORDER_HISTORY,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.STAFF, Role.MANAGER]}
                element={<SuspenseElement component={OrderHistoryPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.STAFF_ORDER_HISTORY}/:slug`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.STAFF, Role.MANAGER]}
                element={<SuspenseElement component={OrderDetailPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_TABLE_MANAGEMENT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER]}
                element={<SuspenseElement component={TablePage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_PRODUCT_MANAGEMENT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER]}
                element={<SuspenseElement component={ProductManagementPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.STAFF_PRODUCT_MANAGEMENT}/:slug`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.ADMIN, Role.MANAGER]}
                element={<SuspenseElement component={ProductDetailPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_MENU_MANAGEMENT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.CHEF, Role.MANAGER]}
                element={<SuspenseElement component={MenuManagementPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.STAFF_MENU_MANAGEMENT}/:slug`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.CHEF, Role.MANAGER]}
                element={<SuspenseElement component={MenuDetailManagementPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_CUSTOMER_MANAGEMENT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={CustomerPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_USER_MANAGEMENT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={EmployeeListPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_ROLE_MANAGEMENT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={RolePage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.STAFF_ROLE_MANAGEMENT}/:slug`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={RoleDetailPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_BRANCH,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER]}
                element={<SuspenseElement component={BranchManagementPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.OVERVIEW,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[
                //   Role.STAFF,
                //   Role.CHEF,
                //   Role.MANAGER,
                //   Role.ADMIN,
                //   Role.SUPER_ADMIN,
                // ]}
                element={<SuspenseElement component={RevenuePage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_STATIC_PAGE,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER]}
                element={<SuspenseElement component={StaticPageManagementPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.STAFF_STATIC_PAGE}/:key`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER]}
                element={<SuspenseElement component={StaticPageDetailPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_LOG_MANAGEMENT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={LoggerPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_PROFILE,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[
                //   Role.STAFF,
                //   Role.CHEF,
                //   Role.MANAGER,
                //   Role.ADMIN,
                //   Role.SUPER_ADMIN,
                // ]}
                element={<SuspenseElement component={ProfilePage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.STAFF_BANK_CONFIG}`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={BankConfigPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.ADMIN_CONFIG}`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={ConfigPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_VOUCHER,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={VoucherPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_PROMOTION,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={PromotionPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.STAFF_CHEF_AREA_MANAGEMENT,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                element={<SuspenseElement component={ChefAreaPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.STAFF_CHEF_AREA_MANAGEMENT}/:slug`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                element={<SuspenseElement component={ChefAreaDetailPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.ADMIN_BANNER,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN]}
                element={<SuspenseElement component={BannerPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.STAFF_BANNER}/:slug`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={SystemLayout} />
          </Suspense>
        ),
      },
      {
        path: ROUTE.DOCS,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={DocsLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.CHEF, Role.STAFF, Role.MANAGER, Role.ADMIN]}
                element={<SuspenseElement component={DocsPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.CLIENT_HOME,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={ClientLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <SuspenseElement component={ClientHomePage} />,
          },
        ],
      },
      {
        path: ROUTE.CLIENT_MENU,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <ClientLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <SuspenseElement component={ClientMenuPage} />,
          },
        ],
      },
      {
        path: `${ROUTE.CLIENT_MENU_ITEM}`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={ClientLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: <SuspenseElement component={ClientProductDetailPage} />,
          },
        ],
      },
      {
        path: ROUTE.CLIENT_CART,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={ClientLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                element={<SuspenseElement component={ClientCartPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.CLIENT_PAYMENT}`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={ClientLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.CUSTOMER]}
                element={<SuspenseElement component={ClientPaymentPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.CLIENT_ORDER_HISTORY}`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={ClientLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.CUSTOMER]}
                element={<SuspenseElement component={ClientOrderHistoryPage} />}
              />
            ),
          },
        ],
      },
      {
        path: `${ROUTE.CLIENT_UPDATE_ORDER}/:slug`,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={ClientLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.CUSTOMER]}
                element={<SuspenseElement component={ClientUpdateOrderPage} />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.HOME,
        element: <ClientLayout />,
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={RoutePermissions[ROUTE.HOME]}
                element={<ClientHomePage />}
              />
            ),
          },
        ],
      },
      {
        path: ROUTE.CLIENT_PROFILE,
        element: (
          <Suspense fallback={<SkeletonCart />}>
            <SuspenseElement component={ClientLayout} />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedElement
                // allowedRoles={[Role.CUSTOMER]}
                element={<SuspenseElement component={ClientProfilePage} />}
              />
            ),
          },
        ],
      },
      {
        path: '*',
        element: <SuspenseElement component={NotFoundPage} />,
      },
    ],
  },
])
