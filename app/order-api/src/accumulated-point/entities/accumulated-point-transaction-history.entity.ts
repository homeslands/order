import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { Order } from 'src/order/order.entity';
import { AccumulatedPoint } from './accumulated-point.entity';

@Entity('accumulated_point_transaction_history_tbl')
export class AccumulatedPointTransactionHistory extends Base {
  @AutoMap()
  @Column({
    name: 'type_column',
  })
  type: string;

  @AutoMap()
  @Column({ name: 'points_column' })
  points: number;

  // The points after the transaction
  @AutoMap()
  @Column({ name: 'last_points_column' })
  lastPoints: number;

  @AutoMap()
  @Column({ name: 'current_points_percentage_column' })
  currentPointsPercentage: number;

  @AutoMap()
  @Column({ type: 'timestamp', precision: 6, name: 'date_column' })
  date: Date;

  @AutoMap()
  @Column({
    name: 'status_column',
  })
  status: string;

  // Many to one with order
  @AutoMap(() => Order)
  @ManyToOne(() => Order, (order) => order.accumulatedPointTransactionHistories)
  @JoinColumn({ name: 'order_column' })
  order: Order;

  // Many to one with accumulated point
  @AutoMap(() => AccumulatedPoint)
  @ManyToOne(
    () => AccumulatedPoint,
    (accumulatedPoint) => accumulatedPoint.transactions,
  )
  @JoinColumn({ name: 'accumulated_point_column' })
  accumulatedPoint: AccumulatedPoint;
}
