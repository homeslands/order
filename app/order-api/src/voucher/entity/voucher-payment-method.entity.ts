import { Base } from 'src/app/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Voucher } from './voucher.entity';
import { AutoMap } from '@automapper/classes';

@Entity('voucher_payment_method_tbl')
export class VoucherPaymentMethod extends Base {
  @ManyToOne(() => Voucher, (voucher) => voucher.voucherPaymentMethods)
  @JoinColumn({ name: 'voucher_column' })
  voucher: Voucher;

  @AutoMap()
  @Column({ name: 'payment_method_column' })
  paymentMethod: string;
}
