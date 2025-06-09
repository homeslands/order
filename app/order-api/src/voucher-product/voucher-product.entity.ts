import { Base } from 'src/app/base.entity';
import { Product } from 'src/product/product.entity';
import { Voucher } from 'src/voucher/voucher.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('voucher_product_tbl')
export class VoucherProduct extends Base {
  @ManyToOne(() => Voucher, (voucher) => voucher.voucherProducts)
  @JoinColumn({ name: 'voucher_column' })
  voucher: Voucher;

  @ManyToOne(() => Product, (product) => product.voucherProducts)
  @JoinColumn({ name: 'product_column' })
  product: Product;
}
