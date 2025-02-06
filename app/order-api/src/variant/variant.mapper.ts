import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  extend,
  forMember,
  Mapper,
  mapWith,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { CreateVariantRequestDto, VariantResponseDto } from './variant.dto';
import { Variant } from './variant.entity';
import { baseMapper } from 'src/app/base.mapper';
import { SizeResponseDto } from 'src/size/size.dto';
import { Size } from 'src/size/size.entity';
import { ProductResponseDto } from 'src/product/product.dto';
import { Product } from 'src/product/product.entity';

@Injectable()
export class VariantProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // Map Entity to response object
      createMap(
        mapper,
        Variant,
        VariantResponseDto,
        forMember(
          (destination) => destination.size,
          mapWith(SizeResponseDto, Size, (source) => source.size),
        ),
        forMember(
          (destination) => destination.product,
          mapWith(ProductResponseDto, Product, (source) => source.product),
        ),
        extend(baseMapper(mapper)),
      );

      // Map request object to entity
      createMap(mapper, CreateVariantRequestDto, Variant);
    };
  }
}
