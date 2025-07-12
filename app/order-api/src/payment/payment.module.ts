import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { BankTransferStrategy } from './strategy/bank-transfer.strategy';
import { InternalStrategy } from './strategy/internal.strategy';
import { CashStrategy } from './strategy/cash.strategy';
import { PaymentProfile } from './payment.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { ACBConnectorModule } from 'src/acb-connector/acb-connector.module';
import { Order } from 'src/order/order.entity';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { PdfModule } from 'src/pdf/pdf.module';
import { UserUtils } from 'src/user/user.utils';
import { User } from 'src/user/user.entity';
import { PaymentUtils } from './payment.utils';
import { DbModule } from 'src/db/db.module';
import { PointStrategy } from './strategy/point.strategy';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, ACBConnectorConfig, User]),
    ACBConnectorModule,
    PdfModule,
    DbModule,
    SharedModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentProfile,
    BankTransferStrategy,
    CashStrategy,
    InternalStrategy,
    PointStrategy,
    UserUtils,
    PaymentUtils,
  ],
  exports: [PaymentService, PaymentUtils],
})
export class PaymentModule {}
