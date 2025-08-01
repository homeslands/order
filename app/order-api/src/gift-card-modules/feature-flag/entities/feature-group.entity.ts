import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { FeatureFlag } from './feature-flag.entity';

@Entity('feature_group_tbl')
export class FeatureGroup extends Base {
  @Column({ name: 'name_column', unique: true })
  @AutoMap()
  name: string;

  @AutoMap()
  @Column({ name: 'order_column' })
  order: number;

  @AutoMap(() => FeatureFlag)
  @OneToMany(() => FeatureFlag, (f) => f.group)
  features: FeatureFlag[];
}
