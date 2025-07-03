import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { CardOrder } from 'src/gift-card-modules/card-order/entities/card-order.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { GiftCardStatus } from '../gift-card.enum';

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
  @AutoMap()
  code: string;

  @Column({ name: 'card_order_id_column' })
  cardOrderId: string;

  @ManyToOne(() => CardOrder, (cardOrder) => cardOrder.giftCards)
  @JoinColumn({ name: 'card_order_column' })
  @AutoMap(() => CardOrder)
  cardOrder: CardOrder;

  @CreateDateColumn({ type: 'timestamp', name: 'used_at_column' })
  @AutoMap(() => Date)
  usedAt: Date;

  @Column({ name: 'used_by_column', nullable: true })
  @AutoMap()
  usedBy: string;

  @CreateDateColumn({ type: 'timestamp', name: 'expired_at_column' })
  @AutoMap(() => Date)
  expiredAt: Date;
}
