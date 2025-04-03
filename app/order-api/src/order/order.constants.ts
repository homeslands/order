export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCEL = 'cancel',
  SHIPPING = 'shipping',
  COMPLETED = 'completed',
}

export enum OrderType {
  TAKE_OUT = 'take-out',
  AT_TABLE = 'at-table',
}

export const OrderAction = {
  INIT_ORDER_ITEM_SUCCESS: 'init.order_item.success',
};
