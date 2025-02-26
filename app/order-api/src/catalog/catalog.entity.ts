import { Entity, Column, OneToMany } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { Product } from 'src/product/product.entity';
import { AutoMap } from '@automapper/classes';

@Entity('catalog_tbl')
export class Catalog extends Base {
  @AutoMap()
  @Column({ name: 'name_column' })
  name: string;

  @AutoMap()
  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @AutoMap()
  @OneToMany(() => Product, (product) => product.catalog)
  products: Product[];
}
