import { Base } from 'src/app/base.entity';
import { CardOrder } from 'src/gift-card-modules/card-order/entities/card-order.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('receipient_tbl')
export class Receipient extends Base {
  @Column({ name: 'quantity_column' })
  quantity: number;

  @Column({ name: 'status_column' })
  status: string;

  @Column({ name: 'message_column', nullable: true })
  message?: string;

  @Column({ name: 'name_column' })
  name: string;

  @Column({ name: 'phone_column' })
  phone: string;

  @Column({ name: 'recipient_id_column' })
  recipientId: string;

  @ManyToOne(() => User, (user) => user.recipientCardOrders)
  @JoinColumn({ name: 'recipient_column' })
  recipient: User;

  @Column({ name: 'sender_id_column' })
  senderId: string;

  @Column({ name: 'sender_name_column' })
  senderName: string;

  @Column({ name: 'sender_phone_column' })
  senderPhone: string;

  @ManyToOne(() => User, (user) => user.senderCardOrders)
  @JoinColumn({ name: 'sender_column' })
  sender: User;

  @Column({ name: 'card_order_id_column', nullable: true })
  cardOrderId: string;

  @ManyToOne(() => CardOrder, (cardOrder) => cardOrder.receipients)
  @JoinColumn({ name: 'card_order_column' })
  cardOrder: CardOrder;
}
