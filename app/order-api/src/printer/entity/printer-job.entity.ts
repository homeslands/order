import { Column, Entity, Index } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';

@Index('idx_status_created_at', ['status', 'createdAt'])
@Entity('printer_job_tbl')
export class PrinterJob extends Base {
  @AutoMap()
  @Column({ name: 'job_type_column' })
  jobType: string;

  @AutoMap()
  @Column({ name: 'status_column' })
  status: string;

  // The id (chef order, invoice, etc.)
  @AutoMap()
  @Column({ name: 'data_column' })
  data: string;

  @AutoMap()
  @Column({ name: 'error_column', nullable: true })
  error?: string;

  @AutoMap()
  @Column({ name: 'printer_ip_column' })
  printerIp: string;

  @AutoMap()
  @Column({ name: 'printer_port_column' })
  printerPort: string;
}
