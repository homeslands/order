import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { Branch } from 'src/branch/branch.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';

@Entity('menu_tbl')
export class Menu extends Base {
  @AutoMap()
  @Column({ name: 'is_template_column', default: false })
  isTemplate: boolean; // Flag to distinguish templates from actual menus

  @AutoMap()
  @Column({ name: 'day_index_column', nullable: true })
  dayIndex?: number; // Index of the day in the week

  @AutoMap()
  @Column({ name: 'image_column', nullable: true })
  image?: string;

  @AutoMap()
  @Column({ name: 'date_column' })
  date: Date;

  // Many to one with branch
  @AutoMap(() => Branch)
  @ManyToOne(() => Branch, (branch) => branch.menus)
  @JoinColumn({ name: 'branch_id_column' })
  branch: Branch;

  // one to many with menu item
  // Cascade insert here means if there is a new MenuItem set
  // on this relation, it will be inserted automatically to the db when you save this Menu entity
  @OneToMany(() => MenuItem, (menuItem) => menuItem.menu, {
    cascade: ['insert', 'update'],
  })
  @AutoMap(() => MenuItem)
  menuItems: MenuItem[];
}
