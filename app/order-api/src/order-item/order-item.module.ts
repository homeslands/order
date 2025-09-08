import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order-item.entity';
import { OrderItemController } from './order-item.controller';
import { OrderItemService } from './order-item.service';
import { OrderItemProfile } from './order-item.mapper';
import { Order } from 'src/order/order.entity';
import { DbModule } from 'src/db/db.module';
import { OrderItemUtils } from './order-item.utils';
import { OrderModule } from 'src/order/order.module';
import { VariantModule } from 'src/variant/variant.module';
import { MenuItemModule } from 'src/menu-item/menu-item.module';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Menu } from 'src/menu/menu.entity';
import { OrderItemScheduler } from './order-item.scheduler';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { UserUtils } from 'src/user/user.utils';
import { User } from 'src/user/user.entity';
import { VoucherProduct } from 'src/voucher-product/voucher-product.entity';
import { ProductUtils } from 'src/product/product.utils';
import { Product } from 'src/product/product.entity';
import { PaymentUtils } from 'src/payment/payment.utils';
import { Payment } from 'src/payment/entity/payment.entity';
import { ACBConnectorModule } from 'src/acb-connector/acb-connector.module';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { AccumulatedPointService } from 'src/accumulated-point/accumulated-point.service';
import { AccumulatedPoint } from 'src/accumulated-point/entities/accumulated-point.entity';
import { AccumulatedPointTransactionHistory } from 'src/accumulated-point/entities/accumulated-point-transaction-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderItem,
      Order,
      Promotion,
      ApplicablePromotion,
      Menu,
      Voucher,
      User,
      VoucherProduct,
      Product,
      Payment,
      ACBConnectorConfig,
      AccumulatedPoint,
      AccumulatedPointTransactionHistory,
    ]),
    DbModule,
    OrderModule,
    VariantModule,
    MenuItemModule,
    ACBConnectorModule,
  ],
  controllers: [OrderItemController],
  providers: [
    OrderItemService,
    OrderItemProfile,
    OrderItemUtils,
    PromotionUtils,
    MenuUtils,
    OrderItemScheduler,
    VoucherUtils,
    UserUtils,
    ProductUtils,
    PaymentUtils,
    BankTransferStrategy,
    AccumulatedPointService,
  ],
  exports: [OrderItemService, OrderItemUtils],
})
export class OrderItemModule {}
