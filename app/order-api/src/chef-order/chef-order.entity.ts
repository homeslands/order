import { AutoMap } from '@automapper/classes';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ChefOrderStatus } from './chef-order.constants';
import { Base } from 'src/app/base.entity';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { Order } from 'src/order/order.entity';
import { ChefArea } from 'src/chef-area/chef-area.entity';

@Entity('chef_order_tbl')
export class ChefOrder extends Base {
  @AutoMap()
  @Column({ name: 'status_column', default: ChefOrderStatus.PENDING })
  status: string;

  @OneToMany(() => ChefOrderItem, (chefOrderItem) => chefOrderItem.chefOrder, {
    cascade: ['insert', 'update'],
  })
  chefOrderItems: ChefOrderItem[];

  @ManyToOne(() => Order, (order) => order.chefOrders)
  @JoinColumn({ name: 'order_column' })
  order: Order;

  @ManyToOne(() => ChefArea, (chefArea) => chefArea.chefOrders)
  @JoinColumn({ name: 'chef_area_column' })
  chefArea: ChefArea;
}
