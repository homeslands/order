import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { ProductProfile } from './product.mapper';
import { Variant } from 'src/variant/variant.entity';
import { Catalog } from 'src/catalog/catalog.entity';
import { FileModule } from 'src/file/file.module';
import { Size } from 'src/size/size.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { ProductUtils } from './product.utils';
import { MenuModule } from 'src/menu/menu.module';
import { BranchUtils } from 'src/branch/branch.utils';
import { Branch } from 'src/branch/branch.entity';
import { VoucherUtils } from 'src/voucher/voucher.utils';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { VoucherProduct } from 'src/voucher-product/voucher-product.entity';
import { OrderUtils } from 'src/order/order.utils';
import { UserUtils } from 'src/user/user.utils';
import { Order } from 'src/order/order.entity';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { DbModule } from 'src/db/db.module';
import { User } from 'src/user/user.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { PaymentUtils } from 'src/payment/payment.utils';
import { Payment } from 'src/payment/entity/payment.entity';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { ACBConnectorModule } from 'src/acb-connector/acb-connector.module';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { AccumulatedPointService } from 'src/accumulated-point/accumulated-point.service';
import { AccumulatedPoint } from 'src/accumulated-point/entities/accumulated-point.entity';
import { AccumulatedPointTransactionHistory } from 'src/accumulated-point/entities/accumulated-point-transaction-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Variant,
      Catalog,
      Size,
      Promotion,
      ApplicablePromotion,
      Branch,
      Voucher,
      VoucherProduct,
      Order,
      User,
      MenuItem,
      Payment,
      ACBConnectorConfig,
      Invoice,
      AccumulatedPoint,
      AccumulatedPointTransactionHistory,
    ]),
    FileModule,
    MenuModule,
    DbModule,
    ACBConnectorModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductProfile,
    PromotionUtils,
    ProductUtils,
    BranchUtils,
    VoucherUtils,
    OrderUtils,
    UserUtils,
    MenuItemUtils,
    PaymentUtils,
    BankTransferStrategy,
    AccumulatedPointService,
  ],
  exports: [ProductService, ProductUtils],
})
export class ProductModule {}
