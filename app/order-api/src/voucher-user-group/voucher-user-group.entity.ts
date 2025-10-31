import { Base } from 'src/app/base.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { UserGroup } from 'src/user-group/user-group.entity';
import { AutoMap } from '@automapper/classes';

@Entity('voucher_user_group_tbl')
export class VoucherUserGroup extends Base {
  @AutoMap()
  @ManyToOne(() => Voucher, (voucher) => voucher.voucherUserGroups)
  @JoinColumn({ name: 'voucher_column' })
  voucher: Voucher;

  @AutoMap()
  @ManyToOne(() => UserGroup, (userGroup) => userGroup.voucherUserGroups)
  @JoinColumn({ name: 'user_group_column' })
  userGroup: UserGroup;
}
