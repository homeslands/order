import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('card_tbl')
export class Card extends Base {
  @Column({ name: 'title_column' })
  @AutoMap()
  title: string;

  @Column({ name: 'image_column', nullable: true, type: 'tinytext' })
  @AutoMap()
  image: string;

  @Column({ name: 'description_column', type: 'text', nullable: true })
  @AutoMap()
  description: string;

  @Column({ name: 'points_column', type: 'decimal', precision: 10, scale: 2 })
  @AutoMap()
  points: number;

  @Column({ name: 'price_column', type: 'decimal', precision: 10, scale: 2 })
  @AutoMap()
  price: number;

  @Column({ name: 'is_active_column', type: 'boolean', default: true })
  @AutoMap()
  isActive: boolean;
}
