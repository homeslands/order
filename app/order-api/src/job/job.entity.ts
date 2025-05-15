import { Base } from 'src/app/base.entity';
import { Column, Entity } from 'typeorm';
import { JobStatus } from './job.constants';
import { AutoMap } from '@automapper/classes';

@Entity('job_tbl')
export class Job extends Base {
  @AutoMap()
  @Column({ name: 'type_column' })
  type: string;

  @AutoMap()
  @Column({ name: 'data_column', type: 'text' })
  data: string;

  @AutoMap()
  @Column({ name: 'status_column', default: JobStatus.PENDING })
  status: string;

  @AutoMap()
  @Column({ name: 'retry_count_column', default: 0 })
  retryCount: number;

  @AutoMap()
  @Column({ name: 'last_error_column', nullable: true })
  lastError?: string;
}
