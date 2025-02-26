import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { WorkflowStatus } from './tracking.constants';
import { TrackingOrderItem } from 'src/tracking-order-item/tracking-order-item.entity';

@Entity('tracking_tbl')
export class Tracking extends Base {
  @AutoMap()
  @Column({ name: 'workflow_execution_column', nullable: true })
  workflowExecution: string;

  @AutoMap()
  @Column({ name: 'status_column', default: WorkflowStatus.PENDING })
  status: string;

  // one to many with tracking order item
  @OneToMany(
    () => TrackingOrderItem,
    (trackingOrderItem) => trackingOrderItem.tracking,
  )
  trackingOrderItems: TrackingOrderItem[];
}
