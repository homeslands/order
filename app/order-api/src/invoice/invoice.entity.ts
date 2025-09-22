import { AutoMap } from '@automapper/classes';
import { IsNumber } from 'class-validator';
import { Base } from 'src/app/base.entity';
import { InvoiceItem } from 'src/invoice-item/invoice-item.entity';
import { Order } from 'src/order/order.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';

@Entity('invoice_tbl')
export class Invoice extends Base {
  @IsNumber()
  @AutoMap()
  @Column({ name: 'reference_number_column', nullable: true })
  referenceNumber: number;

  @AutoMap()
  @Column({ name: 'payment_method_column' })
  paymentMethod: string;

  @AutoMap()
  @Column({ name: 'amount_column' })
  amount: number;

  @AutoMap()
  @Column({ name: 'loss_column', default: 0 })
  loss: number;

  @AutoMap()
  @Column({ name: 'value_each_voucher_column', nullable: true })
  valueEachVoucher?: number;

  @AutoMap()
  @Column({ name: 'voucher_type_column', nullable: true })
  voucherType?: string;

  @AutoMap()
  @Column({ name: 'voucher_rule_column', nullable: true })
  voucherRule?: string;

  @AutoMap()
  @Column({ name: 'voucher_value_column', default: 0 })
  voucherValue: number;

  @AutoMap()
  @Column({ name: 'voucher_id_column', nullable: true })
  voucherId?: string;

  @AutoMap()
  @Column({ name: 'voucher_code_column', nullable: true })
  voucherCode?: string;

  @AutoMap()
  @Column({ name: 'status_column' })
  status: string;

  @AutoMap()
  @Column({ name: 'logo_column' })
  logo: string;

  @AutoMap()
  @Column({ name: 'table_name_column' })
  tableName: string;

  @AutoMap()
  @Column({ name: 'branch_address_column' })
  branchAddress: string;

  @AutoMap()
  @Column({ name: 'cashier_column' })
  cashier: string;

  @AutoMap()
  @Column({ name: 'customer_column' })
  customer: string;

  //   One invoice can have many invoice items
  // Cascade insert here means if there is a new InvoiceItem set
  // on this relation, it will be inserted automatically to the db when you save this Invoice entity
  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice, {
    cascade: ['insert', 'update'],
  })
  @AutoMap(() => InvoiceItem)
  invoiceItems: InvoiceItem[];

  // One to one with order
  @OneToOne(() => Order, (order) => order.invoice)
  order: Order;

  @AutoMap()
  @Column({ name: 'qrcode_column', type: 'text' })
  qrcode: string;

  @AutoMap()
  @Column({ name: 'branch_id_column', nullable: true })
  branchId: string;

  @AutoMap()
  @Column({ name: 'date_column', nullable: true })
  date?: Date;

  @AutoMap()
  @Column({ name: 'accumulated_points_to_use_column', default: 0 })
  accumulatedPointsToUse: number;

  @AutoMap()
  @Column({ name: 'type_column', nullable: true })
  type: string;

  @AutoMap()
  @Column({ name: 'delivery_to_column', nullable: true })
  deliveryTo?: string;

  @AutoMap()
  @Column({ name: 'delivery_phone_column', nullable: true })
  deliveryPhone?: string;

  @AutoMap()
  @Column({ name: 'delivery_distance_column', default: 0 })
  deliveryDistance: number;

  @AutoMap()
  @Column({ name: 'delivery_fee_column', default: 0 })
  deliveryFee: number;
}
