import { Module } from '@nestjs/common';
import { ChefOrderService } from './chef-order.service';
import { ChefOrderController } from './chef-order.controller';
import { ChefOrderUtils } from './chef-order.utils';
import { OrderUtils } from 'src/order/order.utils';
import { Order } from 'src/order/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';
import { ChefOrder } from './chef-order.entity';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { DbModule } from 'src/db/db.module';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Menu } from 'src/menu/menu.entity';
import { ChefOrderProfile } from './chef-order.mapper';
import { ChefAreaUtils } from 'src/chef-area/chef-area.utils';
import { BranchUtils } from 'src/branch/branch.utils';
import { Branch } from 'src/branch/branch.entity';
import { ChefOrderItemUtils } from 'src/chef-order-item/chef-order-item.utils';
import { PdfService } from 'src/pdf/pdf.service';
import { PaymentUtils } from 'src/payment/payment.utils';
import { Payment } from 'src/payment/payment.entity';
import { ACBConnectorModule } from 'src/acb-connector/acb-connector.module';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { PrinterModule } from 'src/printer/printer.module';
import { ChefOrderListener } from './chef-order.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      ChefArea,
      Product,
      ChefOrder,
      ChefOrderItem,
      MenuItem,
      Menu,
      Branch,
      Payment,
      ACBConnectorConfig,
    ]),
    DbModule,
    ACBConnectorModule,
    PrinterModule,
  ],
  controllers: [ChefOrderController],
  providers: [
    ChefOrderService,
    ChefOrderProfile,
    ChefOrderUtils,
    OrderUtils,
    MenuItemUtils,
    MenuUtils,
    ChefAreaUtils,
    BranchUtils,
    ChefOrderItemUtils,
    PdfService,
    PaymentUtils,
    BankTransferStrategy,
    ChefOrderListener,
  ],
  exports: [ChefOrderUtils],
})
export class ChefOrderModule {}
