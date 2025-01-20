import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { OrderItem } from 'src/order-item/order-item.entity';
import { Tracking } from 'src/tracking/tracking.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('tracking_order_item_tbl')
export class TrackingOrderItem extends Base {
  @AutoMap()
  @Column({ name: 'quantity_column' })
  quantity: number;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.trackingOrderItems)
  @JoinColumn({ name: 'order_item_column' })
  orderItem: OrderItem;

  @ManyToOne(() => Tracking, (tracking) => tracking.trackingOrderItems)
  @JoinColumn({ name: 'tracking_column' })
  tracking: Tracking;
}
