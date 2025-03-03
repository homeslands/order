import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('applicable_promotion_tbl')
export class ApplicablePromotion extends Base {
  @AutoMap()
  @Column({ name: 'type_column' })
  type: string;

  @AutoMap()
  @Column({ name: 'applicable_id_column' })
  applicableId: string;

  @AutoMap()
  @ManyToOne(() => Promotion, (promotion) => promotion.applicablePromotions)
  @JoinColumn({ name: 'promotion_column' })
  promotion: Promotion;
}
