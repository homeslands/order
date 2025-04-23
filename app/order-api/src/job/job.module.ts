import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { BullModule } from '@nestjs/bullmq';
import { QueueRegisterKey } from 'src/app/app.constants';
import { JobProducer } from './job.producer';
import { JobConsumer } from './job.consumer';
import { Job } from './job.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderUtils } from 'src/order/order.utils';
import { InvoiceService } from 'src/invoice/invoice.service';
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { Order } from 'src/order/order.entity';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Invoice } from 'src/invoice/invoice.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Product } from 'src/product/product.entity';
import { ChefOrderItemUtils } from 'src/chef-order-item/chef-order-item.utils';
import { User } from 'src/user/user.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Menu } from 'src/menu/menu.entity';
import { JobRecoveryService } from './job.recovery';
import { MailModule } from 'src/mail/mail.module';
import { NotificationModule } from 'src/notification/notification.module';
import { JobScheduler } from './job.scheduler';

@Module({
  imports: [
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
    ]),
    BullModule.registerQueue({
      name: QueueRegisterKey.JOB,
    }),
    MailModule,
    NotificationModule,
  ],
  controllers: [JobController],
  providers: [
    JobService,
    JobProducer,
    JobConsumer,
    OrderUtils,
    InvoiceService,
    ChefOrderUtils,
    MenuItemUtils,
    TransactionManagerService,
    PdfService,
    QrCodeService,
    ChefOrderItemUtils,
    MenuUtils,
    JobRecoveryService,
    JobScheduler,
  ],
  exports: [JobProducer, JobConsumer, BullModule],
})
export class JobModule {}
