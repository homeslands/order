import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Order } from 'src/order/order.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { VoucherType, VoucherValueType } from './voucher.constant';
import { VoucherGroup } from 'src/voucher-group/voucher-group.entity';

@Entity('voucher_tbl')
export class Voucher extends Base {
  @AutoMap()
  @Column({ name: 'code_column', unique: true })
  code: string;

  @AutoMap()
  @Column({ name: 'title_column' })
  title: string;

  @AutoMap()
  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @AutoMap()
  @Column({ name: 'max_usage_column' })
  maxUsage: number;

  @AutoMap()
  @Column({ name: 'remaining_usage_column' })
  remainingUsage: number;

  @AutoMap()
  @Column({ name: 'value_type_column', default: VoucherValueType.PERCENTAGE })
  valueType: string;

  @AutoMap()
  @Column({ name: 'min_order_value_column', default: 0 })
  minOrderValue: number;

  @AutoMap()
  @Column({ name: 'start_date_column' })
  startDate: Date;

  @AutoMap()
  @Column({ name: 'end_date_column' })
  endDate: Date;

  @AutoMap()
  @Column({ name: 'value_column' })
  value: number;

  @AutoMap()
  @Column({ name: 'is_active_column', default: false })
  isActive: boolean;

  @OneToMany(() => Order, (order) => order.voucher)
  orders: Order[];

  @AutoMap()
  @Column({ name: 'is_verification_identity_column', default: true })
  isVerificationIdentity: boolean;

  // display or not for all user
  @AutoMap()
  @Column({ name: 'is_private_column', default: false })
  isPrivate: boolean;

  @AutoMap()
  @Column({ name: 'type_column', default: VoucherType.PERCENT_ORDER })
  type: string;

  @AutoMap()
  @Column({ name: 'number_of_usage_per_user_column', default: 1 })
  numberOfUsagePerUser: number;

  @ManyToOne(() => VoucherGroup, (voucherGroup) => voucherGroup.vouchers)
  @JoinColumn({ name: 'voucher_group_column' })
  voucherGroup?: VoucherGroup;
}
