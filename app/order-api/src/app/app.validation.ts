import { ACBConnectorValidation } from 'src/acb-connector/acb-connector.validation';
import { AuthValidation } from 'src/auth/auth.validation';
import { BranchRevenueValidation } from 'src/branch-revenue/branch-revenue.validation';
import { CatalogValidation } from 'src/catalog/catalog.validation';
import { DbValidation } from 'src/db/db.validation';
import FileValidation from 'src/file/file.validation';
import { InvoiceValidation } from 'src/invoice/invoice.validation';
import { MenuItemValidation } from 'src/menu-item/menu-item.validation';
import { MenuValidation } from 'src/menu/menu.validation';
import { OrderItemValidation } from 'src/order-item/order-item.validation';
import { OrderValidation } from 'src/order/order.validation';
import { PaymentValidation } from 'src/payment/payment.validation';
import { ProductAnalysisValidation } from 'src/product-analysis/product-analysis.validation';
import ProductValidation from 'src/product/product.validation';
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
import { WorkflowValidation } from 'src/workflow/workflow.validation';

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
