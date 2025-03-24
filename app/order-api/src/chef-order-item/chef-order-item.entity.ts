import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChefOrderItemStatus } from './chef-order-item.constants';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { OrderItem } from 'src/order-item/order-item.entity';

@Entity('chef_order_item_tbl')
export class ChefOrderItem extends Base {
  @AutoMap()
  @Column({ name: 'status_column', default: ChefOrderItemStatus.PENDING })
  status: string;

  @AutoMap()
  @Column({
    name: 'default_quantity_column',
    type: 'enum',
    enum: [1],
    default: 1,
  })
  defaultQuantity: number;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.chefOrderItems)
  @JoinColumn({ name: 'order_item_column' })
  orderItem: OrderItem;

  @ManyToOne(() => ChefOrder, (chefOrder) => chefOrder.chefOrderItems)
  @JoinColumn({ name: 'chef_order_column' })
  chefOrder: ChefOrder;
}
