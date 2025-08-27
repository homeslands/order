import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Branch } from 'src/branch/branch.entity';
import { OrderItem } from 'src/order-item/order-item.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OrderStatus } from './order.constants';
import { Payment } from 'src/payment/entity/payment.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { Table } from 'src/table/table.entity';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ORDER_STATUS_INVALID } from './order.validation';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { ChefOrder } from 'src/chef-order/chef-order.entity';

@Entity('order_tbl')
export class Order extends Base {
  @IsNumber()
  @AutoMap()
  @Column({ name: 'original_subtotal_column', default: 0 })
  originalSubtotal: number;

  @IsOptional()
  @IsNumber()
  @AutoMap()
  @Column({ name: 'reference_number_column', nullable: true })
  referenceNumber?: number;

  @IsOptional()
  @AutoMap()
  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @IsNumber()
  @AutoMap()
  @Column({ name: 'subtotal_column' })
  subtotal: number;

  @IsNumber()
  @AutoMap()
  @Column({ name: 'loss_column', default: 0 })
  loss: number;

  @AutoMap()
  @Column({ name: 'status_column', default: OrderStatus.PENDING })
  @IsNotEmpty({ message: ORDER_STATUS_INVALID })
  status: string;

  @AutoMap()
  @Column({ name: 'type_column' })
  @IsNotEmpty()
  type: string;

  // many to one with branch
  @ManyToOne(() => Branch, (branch) => branch.orders)
  @JoinColumn({ name: 'branch_column' })
  branch: Branch;

  // many to one with user (owner)
  @ManyToOne(() => User, (user) => user.ownerOrders)
  @JoinColumn({ name: 'owner_column' })
  owner: User;

  // many to one with user (approval order)
  @ManyToOne(() => User, (user) => user.approvalOrders, { nullable: true })
  @JoinColumn({ name: 'approval_by_column' })
  approvalBy?: User;

  // one to many with order item
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: ['insert', 'update', 'remove'],
  })
  orderItems: OrderItem[];

  // One to one with payment
  @OneToOne(() => Payment, (payment) => payment.order)
  @JoinColumn({ name: 'payment_column' })
  @AutoMap(() => Payment)
  payment: Payment;

  // One to one with invoice
  // Cascade insert here means if there is a new Invoice instance set
  // on this relation, it will be inserted automatically to the db when you save this Order entity
  @OneToOne(() => Invoice, (invoice) => invoice.order, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'invoice_column' })
  @AutoMap(() => Invoice)
  invoice: Invoice;

  @ManyToOne(() => Table, (table) => table.orders, { nullable: true })
  @JoinColumn({ name: 'table_column' })
  @AutoMap(() => Table)
  table: Table;

  @ManyToOne(() => Voucher, (voucher) => voucher.orders, { nullable: true })
  @JoinColumn({ name: 'voucher_column' })
  @AutoMap(() => Voucher)
  voucher: Voucher;

  @OneToMany(() => ChefOrder, (chefOrder) => chefOrder.order)
  chefOrders: ChefOrder[];
}
