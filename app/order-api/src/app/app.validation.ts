import { ACBConnectorValidation } from 'src/acb-connector/acb-connector.validation';
import { ApplicablePromotionValidation } from 'src/applicable-promotion/applicable-promotion.validation';
import { AuthValidation } from 'src/auth/auth.validation';
import { AuthorityValidation } from 'src/authority/authority.validation';
import BannerValidation from 'src/banner/banner.validation';
import { BranchRevenueValidation } from 'src/branch-revenue/branch-revenue.validation';
import { BranchValidation } from 'src/branch/branch.validation';
import { CatalogValidation } from 'src/catalog/catalog.validation';
import ChefAreaValidation from 'src/chef-area/chef-area.validation';
import ChefOrderValidation from 'src/chef-order/chef-order.validation';
import { DbValidation } from 'src/db/db.validation';
import FileValidation from 'src/file/file.validation';
import { BalanceValidation } from 'src/gift-card-modules/balance/balance.validation';
import { CardOrderValidation } from 'src/gift-card-modules/card-order/card-order.validation';
import { CardValidation } from 'src/gift-card-modules/card/card.validation';
import { GiftCardValidation } from 'src/gift-card-modules/gift-card/gift-card.validation';
import { InvoiceValidation } from 'src/invoice/invoice.validation';
import { MenuItemValidation } from 'src/menu-item/menu-item.validation';
import { MenuValidation } from 'src/menu/menu.validation';
import { NotificationValidation } from 'src/notification/notification.validation';
import { OrderItemValidation } from 'src/order-item/order-item.validation';
import { OrderValidation } from 'src/order/order.validation';
import { PaymentValidation } from 'src/payment/payment.validation';
import { PermissionValidation } from 'src/permission/permission.validation';
import { ProductAnalysisValidation } from 'src/product-analysis/product-analysis.validation';
import ProductChefAreaValidation from 'src/product-chef-area/product-chef-area.validation';
import ProductValidation from 'src/product/product.validation';
import { PromotionValidation } from 'src/promotion/promotion.validation';
import { RevenueValidation } from 'src/revenue/revenue.validation';
import { RobotConnectorValidation } from 'src/robot-connector/robot-connector.validation';
import { RoleValidation } from 'src/role/role.validation';
import { SizeValidation } from 'src/size/size.validation';
import { StaticPageValidation } from 'src/static-page/static-page.validation';
import { SystemConfigValidation } from 'src/system-config/system-config.validation';
import { TableValidation } from 'src/table/table.validation';
import { TrackingValidation } from 'src/tracking/tracking.validation';
import { UserValidation } from 'src/user/user.validation';
import { VariantValidation } from 'src/variant/variant.validation';
import { VoucherProductValidation } from 'src/voucher-product/voucher-product.validation';
import { VoucherValidation } from 'src/voucher/voucher.validation';
import { WorkflowValidation } from 'src/workflow/workflow.validation';
import { ZaloOaConnectorValidation } from 'src/zalo-oa-connector/zalo-oa-connector.validation';

export type TErrorCodeValue = {
  code: number;
  message: string;
};
export type TErrorCode = Record<string, TErrorCodeValue>;

// Reusable function for creating error codes
export function createErrorCode(
  code: number,
  message: string,
): TErrorCodeValue {
  return { code, message };
}

export const AppValidation: TErrorCode = {
  ...CatalogValidation,
  ...MenuValidation,
  ...AuthValidation,
  ...FileValidation,
  ...ProductValidation,
  ...PaymentValidation,
  ...OrderValidation,
  ...TableValidation,
  ...VariantValidation,
  ...TrackingValidation,
  ...OrderItemValidation,
  ...WorkflowValidation,
  ...RobotConnectorValidation,
  ...SizeValidation,
  ...ACBConnectorValidation,
  ...DbValidation,
  ...InvoiceValidation,
  ...MenuItemValidation,
  ...UserValidation,
  ...RoleValidation,
  ...SystemConfigValidation,
  ...StaticPageValidation,
  ...ProductAnalysisValidation,
  ...BranchRevenueValidation,
  ...RevenueValidation,
  ...BranchValidation,
  ...PromotionValidation,
  ...ApplicablePromotionValidation,
  ...VoucherValidation,
  ...BannerValidation,
  ...AuthorityValidation,
  ...PermissionValidation,
  ...ChefAreaValidation,
  ...ProductChefAreaValidation,
  ...ChefOrderValidation,
  ...NotificationValidation,
  ...VoucherProductValidation,
  ...CardOrderValidation,
  ...CardValidation,
  ...GiftCardValidation,
  ...BalanceValidation,
  ...ZaloOaConnectorValidation,
};

const errorCodeKeys = Object.keys(AppValidation);
const errorCodeSet = new Set();

errorCodeKeys.forEach((key) => {
  const code = AppValidation[key].code;
  if (errorCodeSet.has(code)) {
    throw new Error(`Duplicate error code found: ${code}`);
  }
  errorCodeSet.add(code);
});
