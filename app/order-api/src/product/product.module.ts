import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { ProductProfile } from './product.mapper';
import { Variant } from 'src/variant/variant.entity';
import { Catalog } from 'src/catalog/catalog.entity';
import { FileModule } from 'src/file/file.module';
import { Size } from 'src/size/size.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Product, 
    Variant, 
    Catalog,
    Size
  ]), FileModule],
  controllers: [ProductController],
  providers: [ProductService, ProductProfile],
  exports: [ProductService],
})
export class ProductModule {}
