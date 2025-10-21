import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroupService } from './user-group.service';
import { UserGroupController } from './user-group.controller';
import { UserGroup } from './user-group.entity';
import { UserGroupProfile } from './user-group.mapper';
import { User } from 'src/user/user.entity';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserGroup, User, Voucher])],
  controllers: [UserGroupController],
  providers: [UserGroupService, UserGroupProfile, TransactionManagerService],
  exports: [UserGroupService],
})
export class UserGroupModule {}
