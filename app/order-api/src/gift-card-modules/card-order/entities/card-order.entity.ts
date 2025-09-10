import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Card } from 'src/gift-card-modules/card/entities/card.entity';
import { GiftCard } from 'src/gift-card-modules/gift-card/entities/gift-card.entity';
import { PaymentStatus } from 'src/payment/payment.constants';
import { Payment } from 'src/payment/entity/payment.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { CardOrderStatus } from '../card-order.enum';
import { Recipient } from 'src/gift-card-modules/receipient/entities/receipient.entity';

@Entity('card_order_tbl')
export class CardOrder extends Base {
  @Column({ name: 'type_column' })
  @AutoMap()
  type: string;

  @Column({ name: 'status_column', default: CardOrderStatus.PENDING })
  @AutoMap()
  status: string;

  @Column({ name: 'total_amount_column' })
  @AutoMap()
  totalAmount: number;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamp', name: 'order_date_column' })
  orderDate: Date;

  // @Column({ name: 'sequence_number_column' })
  // sequence: string;

  @Column({ name: 'quantity_column' })
  @AutoMap()
  quantity: number;

  @ManyToOne(() => Card, (card) => card.cardOrders)
  @JoinColumn({ name: 'card_column' })
  card: Card;

  @Column({ name: 'card_id_column' })
  @AutoMap()
  cardId: string;

  @Column({ name: 'card_slug_column' })
  @AutoMap()
  cardSlug: string;

  @Column({ name: 'card_title_column' })
  @AutoMap()
  cardTitle: string;

  @Column({ name: 'card_point_column' })
  @AutoMap()
  cardPoint: number;

  @Column({ name: 'card_image_column', nullable: true })
  @AutoMap()
  cardImage?: string;

  @Column({ name: 'card_price_column' })
  @AutoMap()
  cardPrice: number;

  @ManyToOne(() => User, (user) => user.customerCardOrders)
  @JoinColumn({ name: 'customer_column' })
  customer: User;

  @Column({ name: 'customer_id_column' })
  @AutoMap()
  customerId: string;

  @Column({ name: 'customer_slug_column' })
  @AutoMap()
  customerSlug: string;

  @Column({ name: 'customer_name_column' })
  @AutoMap()
  customerName: string;

  @Column({ name: 'customer_phone_column' })
  @AutoMap()
  customerPhone: string;

  @ManyToOne(() => User, (user) => user.cashierCardOrders)
  @JoinColumn({ name: 'cashier_column' })
  cashier: User;

  @Column({ name: 'cashier_id_column', nullable: true })
  @AutoMap()
  cashierId?: string;

  @Column({ name: 'cashier_slug_column', nullable: true })
  @AutoMap()
  cashierSlug?: string;

  @Column({ name: 'cashier_name_column', nullable: true })
  @AutoMap()
  cashierName?: string;

  @Column({ name: 'cashier_phone_column', nullable: true })
  @AutoMap()
  cashierPhone?: string;

  @OneToMany(() => Recipient, (receipient) => receipient.cardOrder, {
    onDelete: 'SET NULL',
  })
  @AutoMap(() => Recipient)
  receipients: Recipient[];

  @OneToMany(() => GiftCard, (giftCard) => giftCard.cardOrder, {
    onDelete: 'SET NULL',
  })
  @AutoMap(() => GiftCard)
  giftCards: GiftCard[];

  @Column({ name: 'payment_status_column', default: PaymentStatus.PENDING })
  @AutoMap()
  paymentStatus: string;

  @Column({ name: 'payment_method_column', nullable: true })
  @AutoMap()
  paymentMethod: string;

  @Column({ name: 'payment_slug_column', nullable: true })
  @AutoMap()
  paymentSlug: string;

  @Column({ name: 'payment_id_column', nullable: true })
  @AutoMap()
  paymentId: string;

  // One to one with payment
  @OneToOne(() => Payment, (payment) => payment.cardOrder)
  @JoinColumn({ name: 'payment_column' })
  @AutoMap(() => Payment)
  payment: Payment;

  @Column({ name: 'cancel_by_slug_column', nullable: true })
  @AutoMap()
  cancelBySlug: string;

  @Column({ name: 'cancel_at_column', nullable: true, type: "timestamp" })
  @AutoMap(() => Date)
  cancelAt: Date;

  @Column({ name: 'cancel_by_name_column', nullable: true })
  @AutoMap()
  cancelByName: string;
}
