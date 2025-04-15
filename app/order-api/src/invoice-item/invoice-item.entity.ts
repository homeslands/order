import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('invoice_item_tbl')
export class InvoiceItem extends Base {
  @AutoMap()
  @Column({ name: 'quantity_column' })
  quantity: number;

  @AutoMap()
  @Column({ name: 'price_column' })
  price: number;

  @AutoMap()
  @Column({ name: 'product_name_column' })
  productName: string;

  @AutoMap()
  @Column({ name: 'size_column' })
  size: string;

  @AutoMap()
  @Column({ name: 'total_column' })
  total: number;

  @AutoMap()
  @Column({ name: 'promotion_value_column', default: 0 })
  promotionValue: number;

  @AutoMap()
  @Column({ name: 'promotion_id_column', nullable: true })
  promotionId?: string;

  // if there is a new Invoice instance set
  // on this relation, InvoiceItems will be inserted automatically to the db when you save this Invoice entity
  @ManyToOne(() => Invoice, (invoice) => invoice.invoiceItems)
  @JoinColumn({ name: 'invoice_column' })
  invoice: Invoice;
}
