import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('branch_revenue_tbl')
export class BranchRevenue extends Base {
  @Column({ name: 'total_amount_column' })
  @AutoMap()
  totalAmount: number;

  @Column({ name: 'total_amount_bank_column', default: 0 })
  @AutoMap()
  totalAmountBank: number;

  @Column({ name: 'total_amount_cash_column', default: 0 })
  @AutoMap()
  totalAmountCash: number;

  @Column({ name: 'total_amount_internal_column', default: 0 })
  @AutoMap()
  totalAmountInternal: number;

  @Column({ name: 'original_amount_column', default: 0 })
  @AutoMap()
  originalAmount: number;

  @Column({ name: 'voucher_amount_column', default: 0 })
  @AutoMap()
  voucherAmount: number;

  @Column({ name: 'loss_amount_column', default: 0 })
  @AutoMap()
  lossAmount: number;

  @Column({ name: 'promotion_amount_column', default: 0 })
  @AutoMap()
  promotionAmount: number;

  @AutoMap()
  @Column({ name: 'branch_id_column' })
  branchId: string;

  @AutoMap()
  @Column({ name: 'date_column' })
  date: Date;

  @AutoMap()
  @Column({ name: 'total_order_column' })
  totalOrder: number;

  @AutoMap()
  @Column({ name: 'min_reference_number_order_column', default: 0 })
  minReferenceNumberOrder: number;

  @AutoMap()
  @Column({ name: 'max_reference_number_order_column', default: 0 })
  maxReferenceNumberOrder: number;

  @AutoMap()
  @Column({ name: 'total_order_cash_column', default: 0 })
  totalOrderCash: number;

  @AutoMap()
  @Column({ name: 'total_order_bank_column', default: 0 })
  totalOrderBank: number;

  @AutoMap()
  @Column({ name: 'total_order_internal_column', default: 0 })
  totalOrderInternal: number;

  @AutoMap()
  @Column({ name: 'total_order_point_column', default: 0 })
  totalOrderPoint: number;

  @AutoMap()
  @Column({ name: 'total_amount_point_column', default: 0 })
  totalAmountPoint: number;

  @AutoMap()
  @Column({ name: 'total_accumulated_points_to_use_column', default: 0 })
  totalAccumulatedPointsToUse: number;
  @Column({ name: 'total_amount_credit_card_column', default: 0 })
  @AutoMap()
  totalAmountCreditCard: number;

  @AutoMap()
  @Column({ name: 'total_order_credit_card_column', default: 0 })
  totalOrderCreditCard: number;

  @AutoMap()
  @Column({ name: 'total_delivery_fee_column', default: 0 })
  totalDeliveryFee: number;

  @AutoMap()
  @Column({ name: 'total_cost_gift_product_amount_column', default: 0 })
  totalCostGiftProductAmount: number;
}
