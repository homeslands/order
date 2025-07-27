import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('printer_tbl')
export class Printer extends Base {
  @AutoMap()
  @Column({ name: 'name_column' })
  name: string;

  @AutoMap()
  @Column({ name: 'data_type_column' })
  dataType: string;

  @AutoMap()
  @Column({ name: 'ip_column' })
  ip: string;

  @AutoMap()
  @Column({ name: 'port_column' })
  port: string;

  @AutoMap()
  @Column({ name: 'is_active_column', default: false })
  isActive: boolean;

  @AutoMap()
  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @AutoMap()
  @ManyToOne(() => ChefArea, (chefArea) => chefArea.printers)
  @JoinColumn({ name: 'chef_area_column' })
  chefArea: ChefArea;
}
