import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Card } from 'src/gift-card-modules/card/entities/card.entity';
import { GiftCard } from 'src/gift-card-modules/gift-card/entities/gift-card.entity';
import { Receipient } from 'src/gift-card-modules/receipient/entities/receipient.entity';
import { PaymentStatus } from 'src/payment/payment.constants';
import { Payment } from 'src/payment/payment.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity('card_order_tbl')
export class CardOrder extends Base {
  @Column({ name: 'type_column' })
  type: string;

  @Column({ name: 'status_column' })
  status: string;

  @Column({ name: 'total_amount_column' })
  totalAmount: number;

  @Column({ name: 'order_date_column' })
  orderDate: Date;

  // @Column({ name: 'sequence_number_column' })
  // sequence: string;

  @Column({ name: 'quantity_column' })
  quantity: number;

  @ManyToOne(() => Card, (card) => card.cardOrders)
  @JoinColumn({ name: 'card_column' })
  card: Card;

  @Column({ name: 'card_id_column' })
  cardId: string;

  @Column({ name: 'card_title_column' })
  cardTitle: string;

  @Column({ name: 'card_point_column' })
  cardPoint: number;

  @Column({ name: 'card_image_column' })
  cardImage: string;

  @Column({ name: 'card_price_column' })
  cardPrice: number;

  @ManyToOne(() => User, (user) => user.customerCardOrders)
  @JoinColumn({ name: 'customer_column' })
  customer: User;

  @Column({ name: 'customer_id_column' })
  customerId: string;

  @Column({ name: 'customer_name_column' })
  customerName: string;

  @Column({ name: 'customer_phone_column' })
  customerPhone: string;

  @ManyToOne(() => User, (user) => user.cashierCardOrders)
  @JoinColumn({ name: 'cashier_column' })
  cashier: User;

  @Column({ name: 'cashier_id_column' })
  cashierId: string;

  @Column({ name: 'cashier_name_column' })
  cashierName: string;

  @Column({ name: 'cashier_phone_column' })
  cashierPhone: string;

  @OneToMany(() => Receipient, (receipient) => receipient.cardOrder, {
    onDelete: 'SET NULL',
  })
  receipients: Receipient[];

  @OneToMany(() => GiftCard, (giftCard) => giftCard.cardOrder, {
    onDelete: 'SET NULL',
  })
  giftCards: GiftCard[];

  @Column({ name: 'payment_status_column', default: PaymentStatus.PENDING })
  paymentStatus: string;

  @Column({ name: 'payment_method_column', nullable: true })
  paymentMethod: string;

  // One to one with payment
  @OneToOne(() => Payment, (payment) => payment.order)
  @JoinColumn({ name: 'payment_column' })
  @AutoMap(() => Payment)
  payment: Payment;
}
