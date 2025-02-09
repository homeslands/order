import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Order } from 'src/order/order.entity';
import { Column, Entity, OneToMany } from 'typeorm';

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
}
