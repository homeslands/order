import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('product_chef_area_tbl')
export class ProductChefArea extends Base {
  @AutoMap()
  @ManyToOne(() => Product, (product) => product.productChefAreas)
  @JoinColumn({ name: 'product_column' })
  product: Product;

  @AutoMap()
  @ManyToOne(() => ChefArea, (chefArea) => chefArea.productChefAreas)
  @JoinColumn({ name: 'chef_area_column' })
  chefArea: ChefArea;
}
