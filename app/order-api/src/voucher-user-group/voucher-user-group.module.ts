import { Module } from '@nestjs/common';
import { VoucherUserGroupService } from './voucher-user-group.service';
import { VoucherUserGroupController } from './voucher-user-group.controller';
import { VoucherUserGroup } from './voucher-user-group.entity';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { UserGroup } from 'src/user-group/user-group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherUserGroupProfile } from './voucher-user-group.mapper';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([VoucherUserGroup, Voucher, UserGroup])],
  controllers: [VoucherUserGroupController],
  providers: [
    VoucherUserGroupService,
    VoucherUserGroupProfile,
    TransactionManagerService,
  ],
  exports: [VoucherUserGroupService],
})
export class VoucherUserGroupModule {}
