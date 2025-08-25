import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { BankTransferStrategy } from './strategy/bank-transfer.strategy';
import { InternalStrategy } from './strategy/internal.strategy';
import { CashStrategy } from './strategy/cash.strategy';
import { PaymentProfile } from './payment.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
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
import { VoucherModule } from 'src/voucher/voucher.module';
import { OrderUtils } from 'src/order/order.utils';
import { OrderItemUtils } from 'src/order-item/order-item.utils';
import { Invoice } from 'src/invoice/invoice.entity';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { OrderItem } from 'src/order-item/order-item.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Menu } from 'src/menu/menu.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Voucher } from 'src/voucher/voucher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Order,
      ACBConnectorConfig,
      User,
      Invoice,
      OrderItem,
      MenuItem,
      Menu,
      Voucher,
    ]),
    ACBConnectorModule,
    PdfModule,
    DbModule,
    SharedModule,
    VoucherModule,
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
    OrderUtils,
    OrderItemUtils,
    MenuItemUtils,
    MenuUtils,
  ],
  exports: [PaymentService, PaymentUtils],
})
export class PaymentModule {}
