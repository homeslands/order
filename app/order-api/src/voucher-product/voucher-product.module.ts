import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherProduct } from './voucher-product.entity';
import { VoucherProductService } from './voucher-product.service';
import { VoucherProductController } from './voucher-product.controller';
import { Product } from 'src/product/product.entity';
import { Voucher } from 'src/voucher/entity/voucher.entity';
import { DbModule } from 'src/db/db.module';
import { VoucherProductProfile } from './voucher-product.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoucherProduct, Product, Voucher]),
    DbModule,
  ],
  controllers: [VoucherProductController],
  providers: [VoucherProductService, VoucherProductProfile],
})
export class VoucherProductModule {}
