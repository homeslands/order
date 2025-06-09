import {
  createMap,
  extend,
  forMember,
  Mapper,
  mapWith,
} from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { VoucherProduct } from './voucher-product.entity';
import { VoucherProductResponseDto } from './voucher-product.dto';
import { baseMapper } from 'src/app/base.mapper';
import { Product } from 'src/product/product.entity';
import { ProductResponseDto } from 'src/product/product.dto';

@Injectable()
export class VoucherProductProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(
        mapper,
        VoucherProduct,
        VoucherProductResponseDto,
        extend(baseMapper(mapper)),
        forMember(
          (destination) => destination.product,
          mapWith(ProductResponseDto, Product, (source) => source.product),
        ),
      );
    };
  }
}
