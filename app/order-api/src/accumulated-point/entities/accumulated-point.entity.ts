import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { User } from 'src/user/user.entity';
import { AccumulatedPointTransactionHistory } from './accumulated-point-transaction-history.entity';

@Entity('accumulated_point_tbl')
export class AccumulatedPoint extends Base {
  @AutoMap()
  @Column({ name: 'total_points_column', default: 0 })
  totalPoints: number;

  // Many to one with user
  @AutoMap(() => User)
  @ManyToOne(() => User, (user) => user.accumulatedPoints)
  @JoinColumn({ name: 'user_column' })
  user: User;

  // One to many with transaction history
  @OneToMany(
    () => AccumulatedPointTransactionHistory,
    (transaction) => transaction.accumulatedPoint,
  )
  transactions: AccumulatedPointTransactionHistory[];
}
