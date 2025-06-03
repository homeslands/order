import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { CardOrder } from 'src/gift-card-modules/card-order/entities/card-order.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('receipient_tbl')
export class Receipient extends Base {
  @Column({ name: 'quantity_column' })
  @AutoMap()
  quantity: number;

  @Column({ name: 'status_column' })
  @AutoMap()
  status: string;

  @Column({ name: 'message_column', nullable: true })
  @AutoMap()
  message?: string;

  @Column({ name: 'name_column' })
  @AutoMap()
  name: string;

  @Column({ name: 'phone_column' })
  @AutoMap()
  phone: string;

  @Column({ name: 'recipient_id_column' })
  @AutoMap()
  recipientId: string;

  @ManyToOne(() => User, (user) => user.recipientCardOrders, {cascade: ['insert', 'update']})
  @JoinColumn({ name: 'recipient_column' })
  @AutoMap(() => User)
  recipient: User;

  @Column({ name: 'sender_id_column' })
  @AutoMap()
  senderId: string;

  @Column({ name: 'sender_name_column' })
  @AutoMap()
  senderName: string;

  @Column({ name: 'sender_phone_column' })
  @AutoMap()
  senderPhone: string;

  @ManyToOne(() => User, (user) => user.senderCardOrders)
  @JoinColumn({ name: 'sender_column' })
  @AutoMap(() => User)
  sender: User;

  @Column({ name: 'card_order_id_column', nullable: true })
  cardOrderId: string;

  @ManyToOne(() => CardOrder, (cardOrder) => cardOrder.receipients)
  @JoinColumn({ name: 'card_order_column' })
  cardOrder: CardOrder;
}
