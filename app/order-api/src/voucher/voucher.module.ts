import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { VoucherProfile } from './voucher.mapper';
import { Voucher } from './voucher.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), DbModule],
  controllers: [VoucherController],
  providers: [VoucherService, VoucherProfile],
})
export class VoucherModule {}
