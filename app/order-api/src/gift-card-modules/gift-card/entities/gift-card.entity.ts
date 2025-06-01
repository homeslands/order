import { Base } from 'src/app/base.entity';
import { CardOrder } from 'src/gift-card-modules/card-order/entities/card-order.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('gift_card_tbl')
export class GiftCard extends Base {
  @Column({ name: 'card_name_column' })
  cardName: string;

  @Column({ name: 'card_points_column' })
  cardPoints: number;

  @Column({ name: 'status_column' })
  status: string;

  @Column({ name: 'serial_number_column', unique: true })
  serial: string;

  @Column({ name: 'code_column', unique: true })
  code: string;

  @Column({ name: 'card_order_id_column' })
  cardOrderId: string;

  @ManyToOne(() => CardOrder, (cardOrder) => cardOrder.giftCards)
  @JoinColumn({ name: 'card_order_column' })
  cardOrder: CardOrder;

  @Column({ name: 'used_at_column' })
  usedAt: Date;

  @Column({ name: 'used_by_column' })
  usedBy: string;
}
