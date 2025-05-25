import { Module } from '@nestjs/common';
import { VoucherGroupService } from './voucher-group.service';
import { VoucherGroupController } from './voucher-group.controller';
import { VoucherGroupProfile } from './voucher-group.mapper';
import { VoucherGroupScheduler } from './voucher-group.scheduler';
import { VoucherGroup } from './voucher-group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from 'src/db/db.module';
import { VoucherModule } from 'src/voucher/voucher.module';
import { VoucherGroupUtils } from './voucher-group.utils';
@Module({
  imports: [TypeOrmModule.forFeature([VoucherGroup]), DbModule, VoucherModule],
  controllers: [VoucherGroupController],
  providers: [
    VoucherGroupService,
    VoucherGroupProfile,
    VoucherGroupScheduler,
    VoucherGroupUtils,
  ],
  exports: [VoucherGroupService],
})
export class VoucherGroupModule {}
