import { Module } from '@nestjs/common';
import { InvoiceAreaService } from './invoice-area.service';
import { InvoiceAreaController } from './invoice-area.controller';
import { InvoiceAreaProfile } from './invoice-area.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceArea } from './invoice-area.entity';
import { Printer } from 'src/printer/entity/printer.entity';
import { Branch } from 'src/branch/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceArea, Printer, Branch])],
  controllers: [InvoiceAreaController],
  providers: [InvoiceAreaService, InvoiceAreaProfile],
})
export class InvoiceAreaModule {}
