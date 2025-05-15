import {
  createMap,
  extend,
  forMember,
  Mapper,
  mapWith,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { baseMapper } from 'src/app/base.mapper';
import { ProductChefArea } from './product-chef-area.entity';
import {
  CreateProductChefAreaRequestDto,
  ProductChefAreaResponseDto,
  UpdateProductChefAreaRequestDto,
} from './product-chef-area.dto';
import { Product } from 'src/product/product.entity';
import { ProductResponseDto } from 'src/product/product.dto';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
import { ChefArea } from 'src/chef-area/chef-area.entity';

@Injectable()
export class ProductChefAreaProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // Map entity to response
      createMap(
        mapper,
        ProductChefArea,
        ProductChefAreaResponseDto,
        forMember(
          (d) => d.chefArea,
          mapWith(ChefAreaResponseDto, ChefArea, (s) => s.chefArea),
        ),
        forMember(
          (d) => d.product,
          mapWith(ProductResponseDto, Product, (s) => s.product),
        ),
        extend(baseMapper(mapper)),
      );

      // Map request object to entity
      createMap(mapper, CreateProductChefAreaRequestDto, ProductChefArea);
      createMap(mapper, UpdateProductChefAreaRequestDto, ProductChefArea);
    };
  }
}
