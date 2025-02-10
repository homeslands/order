import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { Menu } from 'src/menu/menu.entity';
import { Table } from 'src/table/table.entity';
import { User } from 'src/user/user.entity';
import { Order } from 'src/order/order.entity';
import { Workflow } from 'src/workflow/workflow.entity';
import { ProductAnalysis } from 'src/product-analysis/product-analysis.entity';
import { Promotion } from 'src/promotion/promotion.entity';

@Entity('branch_tbl')
export class Branch extends Base {
  @AutoMap()
  @Column({ name: 'name_column' })
  name: string;

  @AutoMap()
  @Column({ name: 'address_column' })
  address: string;

  // one to many with menu
  @OneToMany(() => Menu, (menu) => menu.branch)
  menus: Menu[];

  // one to many with table
  @OneToMany(() => Table, (table) => table.branch)
  tables: Table[];

  // one to many with user
  @OneToMany(() => User, (user) => user.branch)
  users: User[];

  // one to many with order
  @OneToMany(() => Order, (order) => order.branch)
  orders: Order[];

  // one to many with workflow
  @OneToMany(() => Workflow, (workflow) => workflow.branch)
  workflows: Workflow[];

  // one to many with product analysis
  @OneToMany(() => ProductAnalysis, (p) => p.branch)
  productAnalyses: ProductAnalysis[];

  @OneToMany(() => Promotion, (promotion) => promotion.branch)
  promotions: Promotion[];
}
