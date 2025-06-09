import { Module } from '@nestjs/common';
import { InvoiceItemService } from './invoice-item.service';
import { InvoiceItemController } from './invoice-item.controller';
import { InvoiceItemProfile } from './invoice-item.mapper';
import { InvoiceItem } from './invoice-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceItem]), DbModule],
  controllers: [InvoiceItemController],
  providers: [InvoiceItemService, InvoiceItemProfile],
})
export class InvoiceItemModule {}
