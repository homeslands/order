import { Column, Entity, OneToMany } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { FeatureFlagSystem } from './feature-flag-system.entity';

@Entity('feature_system_group_tbl')
export class FeatureSystemGroup extends Base {
  @AutoMap()
  @Column({ name: 'name_column', unique: true })
  name: string;

  @AutoMap()
  @Column({ name: 'order_column' })
  order: number;

  @AutoMap()
  @OneToMany(() => FeatureFlagSystem, (f) => f.group)
  features: FeatureFlagSystem[];
}
