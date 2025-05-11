import { AutoMap } from '@automapper/classes';
import { Base } from 'src/app/base.entity';
import { Voucher } from 'src/voucher/voucher.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('voucher_group_tbl')
export class VoucherGroup extends Base {
  @AutoMap()
  @Column({ name: 'title_column', unique: true })
  title: string;

  @AutoMap()
  @Column({ name: 'description_column', nullable: true })
  description?: string;

  @OneToMany(() => Voucher, (voucher) => voucher.voucherGroup)
  vouchers: Voucher[];
}
