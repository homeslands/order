import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Branch } from 'src/branch/branch.entity';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { Printer } from 'src/printer/printer.entity';
import { ProductChefArea } from 'src/product-chef-area/product-chef-area.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('chef_area_tbl')
export class ChefArea extends Base {
  @AutoMap()
  @Column({ name: 'name_column' })
  name: string;

  @AutoMap()
  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @AutoMap()
  @ManyToOne(() => Branch, (branch) => branch.chefAreas)
  @JoinColumn({ name: 'branch_column' })
  branch: Branch;

  @OneToMany(() => ProductChefArea, (p) => p.chefArea)
  productChefAreas: ProductChefArea[];

  @OneToMany(() => ChefOrder, (chefOrder) => chefOrder.chefArea)
  chefOrders: ChefOrder[];

  @OneToMany(() => Printer, (printer) => printer.chefArea)
  printers: Printer[];
}
