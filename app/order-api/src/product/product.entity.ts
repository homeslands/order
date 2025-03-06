import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { Catalog } from 'src/catalog/catalog.entity';
import { Variant } from 'src/variant/variant.entity';
import { AutoMap } from '@automapper/classes';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { ProductAnalysis } from 'src/product-analysis/product-analysis.entity';

@Entity('product_tbl')
export class Product extends Base {
  @AutoMap()
  @Column({ name: 'name_column' })
  name: string;

  @AutoMap()
  @Column({ name: 'description_column', nullable: true, type: 'text' })
  description?: string;

  @AutoMap()
  @Column({ name: 'is_active_column', default: true })
  isActive: boolean;

  @AutoMap()
  @Column({ name: 'is_limit_column', default: true })
  isLimit: boolean;

  // Thumbnail image
  @AutoMap()
  @Column({ name: 'image_column', nullable: true })
  image?: string;

  @AutoMap()
  @Column('text', { name: 'images_column', nullable: true })
  images?: string;

  @AutoMap()
  @Column({ name: 'rating_column', nullable: true })
  rating?: number;

  // many to one with catalog
  @ManyToOne(() => Catalog, (catalog) => catalog.products)
  @JoinColumn({ name: 'catalog_column' })
  catalog: Catalog;

  // one to many with product variant
  @OneToMany(() => Variant, (variant) => variant.product)
  variants: Variant[];

  // one to many with menu item
  @OneToMany(() => MenuItem, (menuItem) => menuItem.product)
  menuItems: MenuItem[];

  // one to many with product analysis
  @OneToMany(() => ProductAnalysis, (p) => p.product)
  productAnalyses: ProductAnalysis[];

  @AutoMap()
  @Column({ name: 'is_top_sell', default: false })
  isTopSell: boolean;

  @AutoMap()
  @Column({ name: 'isNew', default: false })
  isNew: boolean;

  @AutoMap()
  @Column({ name: 'sale_quantity_history', default: 0 })
  saleQuantityHistory: number;
}
