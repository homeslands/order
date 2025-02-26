import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Branch } from 'src/branch/branch.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('workflow_tbl')
export class Workflow extends Base {
  @AutoMap()
  @Column({ name: 'workflow_id_column' })
  workflowId: string;

  @ManyToOne(() => Branch, (branch) => branch.workflows)
  @JoinColumn({ name: 'branch_column' })
  branch: Branch;
}
