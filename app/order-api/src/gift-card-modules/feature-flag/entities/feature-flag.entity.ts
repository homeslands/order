import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { FeatureGroup } from './feature-group.entity';

@Entity('feature_flag_tbl')
export class FeatureFlag extends Base {
  @Column({ name: 'group_name_column' })
  @AutoMap()
  groupName: string;

  @Column({ name: 'group_slug_column' })
  @AutoMap()
  groupSlug: string;

  @AutoMap()
  @Column({ name: 'name_column', unique: true })
  name: string;

  @AutoMap()
  @Column({ name: 'is_locked_column', default: false })
  isLocked: boolean;

  @AutoMap()
  @Column({ name: 'order_column', type: 'int' })
  order: number;

  @AutoMap(() => FeatureGroup)
  @ManyToOne(() => FeatureGroup, (f) => f.features)
  @JoinColumn({ name: 'group_column' })
  group: FeatureGroup;
}
