import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VariantController } from './variant.controller';
import { VariantService } from './variant.service';
import { Variant } from './variant.entity';
import { VariantProfile } from './variant.mapper';
import { Product } from 'src/product/product.entity';
import { Size } from 'src/size/size.entity';
import { VariantUtils } from './variant.utils';

@Module({
  imports: [TypeOrmModule.forFeature([Variant, Product, Size])],
  controllers: [VariantController],
  providers: [VariantService, VariantProfile, VariantUtils],
  exports: [VariantService, VariantUtils],
})
export class VariantModule {}
