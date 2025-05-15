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
import { ChefArea } from './chef-area.entity';
import {
  ChefAreaResponseDto,
  CreateChefAreaRequestDto,
  UpdateChefAreaRequestDto,
} from './chef-area.dto';
import { BranchResponseDto } from 'src/branch/branch.dto';
import { Branch } from 'src/branch/branch.entity';
import { ChefOrderResponseDto } from 'src/chef-order/chef-order.dto';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { ProductChefAreaResponseDto } from 'src/product-chef-area/product-chef-area.dto';
import { ProductChefArea } from 'src/product-chef-area/product-chef-area.entity';

@Injectable()
export class ChefAreaProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      // Map entity to response
      createMap(
        mapper,
        ChefArea,
        ChefAreaResponseDto,
        forMember(
          (d) => d.branch,
          mapWith(BranchResponseDto, Branch, (s) => s.branch),
        ),
        forMember(
          (d) => d.chefOrders,
          mapWith(ChefOrderResponseDto, ChefOrder, (s) => s.chefOrders),
        ),
        forMember(
          (d) => d.productChefAreas,
          mapWith(
            ProductChefAreaResponseDto,
            ProductChefArea,
            (s) => s.productChefAreas,
          ),
        ),
        extend(baseMapper(mapper)),
      );

      // Map request object to entity
      createMap(mapper, CreateChefAreaRequestDto, ChefArea);
      createMap(mapper, UpdateChefAreaRequestDto, ChefArea);
    };
  }
}
