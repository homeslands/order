import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { ProductProfile } from './product.mapper';
import { Variant } from 'src/variant/variant.entity';
import { Catalog } from 'src/catalog/catalog.entity';
import { FileModule } from 'src/file/file.module';
import { Size } from 'src/size/size.entity';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { Promotion } from 'src/promotion/promotion.entity';
import { ApplicablePromotion } from 'src/applicable-promotion/applicable-promotion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Variant,
      Catalog,
      Size,
      Promotion,
      ApplicablePromotion,
    ]),
    FileModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductProfile, PromotionUtils],
  exports: [ProductService],
})
export class ProductModule {}
