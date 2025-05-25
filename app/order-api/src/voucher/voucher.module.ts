import { forwardRef, Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { VoucherProfile } from './voucher.mapper';
import { Voucher } from './voucher.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from 'src/db/db.module';
import { VoucherUtils } from './voucher.utils';
import { VoucherScheduler } from './voucher.scheduler';
import { OrderModule } from 'src/order/order.module';
import { VoucherSubscriber } from './voucher.subscriber';
import { UserModule } from 'src/user/user.module';
import { VoucherGroupUtils } from 'src/voucher-group/voucher-group.utils';
import { VoucherGroup } from 'src/voucher-group/voucher-group.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { QrCodeService } from 'src/qr-code/qr-code.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Voucher, VoucherGroup]),
    DbModule,
    UserModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [VoucherController],
  providers: [
    VoucherService,
    VoucherProfile,
    VoucherUtils,
    VoucherScheduler,
    VoucherSubscriber,
    VoucherGroupUtils,
    PdfService,
    QrCodeService,
  ],
  exports: [VoucherUtils],
})
export class VoucherModule {}
