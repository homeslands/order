import { Module } from '@nestjs/common';
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
    ]),
    RobotConnectorModule,
    DbModule,
    BranchModule,
    TableModule,
    UserModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderProfile,
    OrderSubscriber,
    OrderScheduler,
    OrderUtils,
  ],
  exports: [OrderService, OrderUtils],
})
export class OrderModule {}
