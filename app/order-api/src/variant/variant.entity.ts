import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Base } from 'src/app/base.entity';
import { Size } from 'src/size/size.entity';
import { Product } from 'src/product/product.entity';
import { AutoMap } from '@automapper/classes';
import { OrderItem } from 'src/order-item/order-item.entity';

@Entity('variant_tbl')
export class Variant extends Base {
  @AutoMap()
  @Column({ name: 'price_column' })
  price: number;

  @AutoMap()
  @Column({ name: 'cost_price_column', default: 0 })
  costPrice: number;

  @ManyToOne(() => Size, (size) => size.variants)
  @JoinColumn({ name: 'size_column' })
  size: Size;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_column' })
  product: Product;

  // one to many with order item
  @OneToMany(() => OrderItem, (orderItem) => orderItem.variant)
  orderItems: OrderItem[];
}
