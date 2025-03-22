import { Module } from '@nestjs/common';
import { ProductChefAreaService } from './product-chef-area.service';
import { ProductChefAreaController } from './product-chef-area.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductChefArea } from './product-chef-area.entity';
import { ProductChefAreaProfile } from './product-chef-area.mapper';
import { ProductChefAreaUtils } from './product-chef-area.utils';
import { ChefAreaUtils } from 'src/chef-area/chef-area.utils';
import { ProductUtils } from 'src/product/product.utils';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Branch } from 'src/branch/branch.entity';
import { Product } from 'src/product/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductChefArea, ChefArea, Branch, Product]),
  ],
  controllers: [ProductChefAreaController],
  providers: [
    ProductChefAreaService,
    ProductChefAreaProfile,
    ProductChefAreaUtils,
    ChefAreaUtils,
    ProductUtils,
  ],
  exports: [ProductChefAreaUtils],
})
export class ProductChefAreaModule {}
