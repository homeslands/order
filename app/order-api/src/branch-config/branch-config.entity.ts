import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Branch } from 'src/branch/branch.entity';

@Entity('branch_config_tbl')
@Unique(['key', 'branch'])
export class BranchConfig extends Base {
  @Column({ name: 'key_column' })
  @AutoMap()
  key: string;

  @Column({ name: 'value_column' })
  @AutoMap()
  value: string;

  @Column({ name: 'description_column', nullable: true, type: 'text' })
  @AutoMap()
  description?: string;

  @ManyToOne(() => Branch, (branch) => branch.branchConfigs)
  @JoinColumn({ name: 'branch_column' })
  branch: Branch;
}
