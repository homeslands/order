import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { FeatureSystemGroup } from './feature-system-group.entity';

@Entity('feature_flag_system_tbl')
@Unique(['name', 'groupName'])
export class FeatureFlagSystem extends Base {
  @AutoMap()
  @Column({ name: 'group_name_column' })
  groupName: string;

  @AutoMap()
  @Column({ name: 'name_column' })
  name: string;

  @AutoMap()
  @Column({ name: 'order_column' })
  order: number;

  @AutoMap()
  @Column({ name: 'is_locked_column', default: false })
  isLocked: boolean;

  @AutoMap()
  @ManyToOne(() => FeatureSystemGroup, (f) => f.features)
  @JoinColumn({ name: 'group_column' })
  group: FeatureSystemGroup;
}
