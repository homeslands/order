export enum VoucherType {
  PERCENT_ORDER = 'percent_order',
  FIXED_VALUE = 'fixed_value',
  SAME_PRICE_PRODUCT = 'same_price_product',
}

export enum VoucherApplicabilityRule {
  ALL_REQUIRED = 'all_required',
  AT_LEAST_ONE_REQUIRED = 'at_least_one_required',
}

export enum VoucherValueType {
  PERCENTAGE = 'percentage',
  AMOUNT = 'amount',
}
