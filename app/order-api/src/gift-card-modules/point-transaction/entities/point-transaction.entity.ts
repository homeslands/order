import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('point_transaction_tbl')
export class PointTransaction extends Base {
  @Column({ name: 'type_column' }) // IN, OUT
  @AutoMap()
  type: string;

  @Column({ name: 'desc_column', nullable: true })
  @AutoMap()
  desc: string;

  @Column({ name: 'object_id_column' })
  @AutoMap()
  objectId: string; // ORDER, GIFT_CARD

  @Column({ name: 'object_type_column' })
  @AutoMap()
  objectType: string;

  @Column({ name: 'object_slug_column' })
  @AutoMap()
  objectSlug: string;

  @Column({ name: 'points_column' })
  @AutoMap()
  points: number;

  @AutoMap()
  @ManyToOne(() => User, (user) => user.pointTransactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_column' })
  user: User;

  @Column({ name: 'user_id_column' })
  @AutoMap()
  userId: string;

  @Column({ name: 'user_slug_column' })
  @AutoMap()
  userSlug: string;
}
