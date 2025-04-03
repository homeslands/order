import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('branch_revenue_tbl')
export class BranchRevenue extends Base {
  @Column({ name: 'total_amount_column' })
  @AutoMap()
  totalAmount: number;

  @Column({ name: 'original_amount_column', default: 0 })
  @AutoMap()
  originalAmount: number;

  @Column({ name: 'voucher_amount_column', default: 0 })
  @AutoMap()
  voucherAmount: number;

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
}
