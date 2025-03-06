import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { AutoMap } from '@automapper/classes';
import { Product } from 'src/product/product.entity';
import { Menu } from 'src/menu/menu.entity';
import { Promotion } from 'src/promotion/promotion.entity';

@Entity('menu_item_tbl')
export class MenuItem extends Base {
  @AutoMap()
  @Column({ name: 'default_stock_column' })
  defaultStock: number;

  @AutoMap()
  @Column({ name: 'current_stock_column' })
  currentStock: number;

  // Many to one with branch
  @AutoMap()
  @ManyToOne(() => Menu, (menu) => menu.menuItems)
  @JoinColumn({ name: 'menu_id_column' })
  menu: Menu;

  // Many to one with product
  @AutoMap(() => Product)
  @ManyToOne(() => Product, (product) => product.menuItems)
  @JoinColumn({ name: 'product_id_column' })
  product: Product;

  @ManyToOne(() => Promotion, (promotion) => promotion.menuItems, {
    nullable: true,
  })
  @JoinColumn({ name: 'promotion_column' })
  promotion: Promotion;
}
