import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderProfile } from './order.mapper';
import { Table } from 'src/table/table.entity';
import { Branch } from 'src/branch/branch.entity';
import { User } from 'src/user/user.entity';
import { Variant } from 'src/variant/variant.entity';
import { RobotConnectorModule } from 'src/robot-connector/robot-connector.module';
import { Tracking } from 'src/tracking/tracking.entity';
import { Menu } from 'src/menu/menu.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { OrderSubscriber } from './order.subscriber';
import { OrderScheduler } from './order.scheduler';
import { DbModule } from 'src/db/db.module';
import { OrderUtils } from './order.utils';
import { BranchModule } from 'src/branch/branch.module';
import { TableModule } from 'src/table/table.module';
import { UserModule } from 'src/user/user.module';
import { MenuItemModule } from 'src/menu-item/menu-item.module';
import { VariantModule } from 'src/variant/variant.module';
import { MenuModule } from 'src/menu/menu.module';
import { VoucherModule } from 'src/voucher/voucher.module';
import { OrderListener } from './order.listener';
import { OrderItemUtils } from 'src/order-item/order-item.utils';
import { OrderItem } from 'src/order-item/order-item.entity';
import { Promotion } from 'src/promotion/promotion.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { MailModule } from 'src/mail/mail.module';
import { PromotionModule } from 'src/promotion/promotion.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { PdfModule } from 'src/pdf/pdf.module';
import { QrCodeModule } from 'src/qr-code/qr-code.module';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';
import { ProductChefArea } from 'src/product-chef-area/product-chef-area.entity';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { ChefOrderItemUtils } from 'src/chef-order-item/chef-order-item.utils';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Table,
      Branch,
      User,
      Variant,
      Tracking,
      Menu,
      MenuItem,
      OrderItem,
      Promotion,
      ApplicablePromotion,
      Invoice,
      ChefArea,
      Product,
      ProductChefArea,
      ChefOrder,
      ChefOrderItem,
    ]),
    RobotConnectorModule,
    DbModule,
    BranchModule,
    TableModule,
    UserModule,
    MenuItemModule,
    VariantModule,
    MenuModule,
    forwardRef(() => VoucherModule),
    MailModule,
    PromotionModule,
    InvoiceModule,
    PdfModule,
    QrCodeModule,
    NotificationModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderProfile,
    OrderSubscriber,
    OrderScheduler,
    OrderUtils,
    OrderListener,
    OrderItemUtils,
    ChefOrderUtils,
    ChefOrderItemUtils,
  ],
  exports: [OrderService, OrderUtils, OrderScheduler],
})
export class OrderModule {}
