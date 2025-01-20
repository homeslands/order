import { Column, Entity } from 'typeorm';
import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';

@Entity('static_page_tbl')
export class StaticPage extends Base {
  @AutoMap()
  @Column({ name: 'key_column', unique: true })
  key: string;

  @AutoMap()
  @Column({ name: 'title_column' })
  title: string;

  @AutoMap()
  @Column({ name: 'content_column', type: 'text', nullable: true })
  content: string;
}
