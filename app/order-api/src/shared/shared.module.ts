import { Module } from '@nestjs/common';
import { Order } from 'src/order/order.entity';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { Invoice } from 'src/invoice/invoice.entity';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';
import { User } from 'src/user/user.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Menu } from 'src/menu/menu.entity';
import { CardOrder } from 'src/gift-card-modules/card-order/entities/card-order.entity';
import { Payment } from 'src/payment/payment.entity';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { DbModule } from 'src/db/db.module';
import { Balance } from 'src/gift-card-modules/balance/entities/balance.entity';
import { Job } from 'src/job/job.entity';
import { SharedBalanceService } from './services/shared-balance.service';
import { SharedPointTransactionService } from './services/shared-point-transaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCard } from 'src/gift-card-modules/gift-card/entities/gift-card.entity';

@Module({
  imports: [
    DbModule,
    TypeOrmModule.forFeature([
      Job,
      Order,
      ChefOrder,
      ChefOrderItem,
      Invoice,
      ChefArea,
      Product,
      ChefOrderItem,
      User,
      MenuItem,
      Menu,
      CardOrder,
      Payment,
      ACBConnectorConfig,
      Balance,
      GiftCard,
    ]),
  ],
  providers: [SharedBalanceService, SharedPointTransactionService],
  exports: [SharedBalanceService, SharedPointTransactionService],
})
export class SharedModule {}
