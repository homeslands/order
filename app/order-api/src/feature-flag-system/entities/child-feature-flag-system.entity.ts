import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { FeatureFlagSystem } from './feature-flag-system.entity';

@Entity('child_feature_flag_system_tbl')
@Unique(['name', 'parentName'])
export class ChildFeatureFlagSystem extends Base {
  @AutoMap()
  @Column({ name: 'name_column' })
  name: string;

  @AutoMap()
  @Column({ name: 'description_column' })
  description: string;

  @AutoMap()
  @Column({ name: 'parent_name_column' })
  parentName: string;

  @AutoMap()
  @Column({ name: 'is_locked_column', default: false })
  isLocked: boolean;

  @AutoMap()
  @ManyToOne(() => FeatureFlagSystem, (f) => f.children, {})
  @JoinColumn({ name: 'feature_flag_system_column' })
  featureFlagSystem: FeatureFlagSystem;
}
