import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Order } from 'src/order/order.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity('payment_tbl')
export class Payment extends Base {
  @AutoMap()
  @Column({ name: 'amount_column' })
  amount: number;

  @AutoMap()
  @Column({ name: 'message_column' })
  message: string;

  @AutoMap()
  @Column({ name: 'status_code_column', nullable: true })
  statusCode?: string;

  @AutoMap()
  @Column({ name: 'status_message_column', nullable: true })
  statusMessage?: string;

  @AutoMap()
  @Column({ name: 'user_id_column' })
  userId: string;

  @AutoMap()
  @Column({ name: 'transaction_id_column' })
  transactionId: string;

  @AutoMap()
  @Column({ name: 'payment_method_column' })
  paymentMethod: string;

  // One to one with order
  @OneToOne(() => Order, (order) => order.payment)
  order: Order;

  @AutoMap()
  @Column({ name: 'qrcode_column', nullable: true, type: 'text' })
  qrCode?: string;
}
