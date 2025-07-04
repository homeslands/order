import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { CardOrder } from 'src/gift-card-modules/card-order/entities/card-order.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { GiftCardStatus } from '../gift-card.enum';
import { User } from 'src/user/user.entity';

@Entity('gift_card_tbl')
export class GiftCard extends Base {
  @Column({ name: 'card_name_column' })
  @AutoMap()
  cardName: string;

  @Column({ name: 'card_points_column' })
  @AutoMap()
  cardPoints: number;

  @Column({ name: 'status_column', default: GiftCardStatus.AVAILABLE })
  @AutoMap()
  status: string;

  @Column({ name: 'serial_number_column', unique: true })
  @AutoMap()
  serial: string;

  @Column({ name: 'code_column', unique: true })
  code: string;

  @Column({ name: 'card_order_id_column' })
  cardOrderId: string;

  @AutoMap()
  @Column({ name: 'card_order_slug_column' })
  cardOrderSlug: string;

  @ManyToOne(() => CardOrder, (cardOrder) => cardOrder.giftCards)
  @JoinColumn({ name: 'card_order_column' })
  @AutoMap(() => CardOrder)
  cardOrder: CardOrder;

  @AutoMap(() => Date)
  @Column({ type: 'timestamp', name: 'used_at_column', nullable: true })
  @AutoMap(() => Date)
  usedAt: Date;

  @Column({ name: 'used_by_id_column', nullable: true })
  @AutoMap()
  usedById: string;

  @AutoMap()
  @Column({ name: 'used_by_slug_column', nullable: true })
  usedBySlug: string;

  @AutoMap()
  @ManyToOne(() => User, (u) => u.giftCards, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'used_by_column' })
  usedBy: User;

  @Column({ type: 'timestamp', name: 'expired_at_column' })
  @AutoMap(() => Date)
  expiredAt: Date;
}
