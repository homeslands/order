import { Module } from '@nestjs/common';
import { BranchRevenueController } from './branch-revenue.controller';
import { BranchRevenueService } from './branch-revenue.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';
import { BranchRevenue } from './branch-revenue.entity';
import { BranchRevenueScheduler } from './branch-revenue.scheduler';
import { BranchRevenueProfile } from './branch-revenue.mapper';
import { DbModule } from 'src/db/db.module';
import { BranchUtils } from 'src/branch/branch.utils';
import { FileService } from 'src/file/file.service';
import { File } from 'src/file/file.entity';
import { PdfService } from 'src/pdf/pdf.service';
import { Order } from 'src/order/order.entity';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { OrderUtils } from 'src/order/order.utils';
import { MenuItemUtils } from 'src/menu-item/menu-item.utils';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { MenuUtils } from 'src/menu/menu.utils';
import { Menu } from 'src/menu/menu.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Branch,
      BranchRevenue,
      File,
      Order,
      MenuItem,
      Menu,
    ]),
    DbModule,
  ],
  controllers: [BranchRevenueController],
  providers: [
    BranchRevenueService,
    BranchRevenueScheduler,
    BranchRevenueProfile,
    BranchUtils,
    FileService,
    PdfService,
    QrCodeService,
    OrderUtils,
    MenuItemUtils,
    MenuUtils,
  ],
  exports: [BranchRevenueService],
})
export class BranchRevenueModule {}
