import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('balance_tbl')
export class Balance extends Base {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'points_column',
    default: 0,
  })
  @AutoMap()
  points: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_column' })
  @AutoMap(() => User)
  user: User;
}
