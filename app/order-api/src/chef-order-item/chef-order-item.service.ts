import { Injectable } from '@nestjs/common';
import { ChefOrderItemUtils } from './chef-order-item.utils';
import {
  ChefOrderItemResponseDto,
  UpdateChefOrderItemRequestDto,
} from './chef-order-item.dto';
import { ChefOrderItem } from './chef-order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

@Injectable()
export class ChefOrderItemService {
  constructor(
    @InjectRepository(ChefOrderItem)
    private readonly chefOrderItemRepository: Repository<ChefOrderItem>,
    private readonly chefOrderItemUtils: ChefOrderItemUtils,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async update(
    slug: string,
    requestData: UpdateChefOrderItemRequestDto,
  ): Promise<ChefOrderItemResponseDto> {
    const chefOrderItem = await this.chefOrderItemUtils.getChefOrderItem({
      where: { slug },
    });

    Object.assign(chefOrderItem, { status: requestData.status });
    const updated = await this.chefOrderItemRepository.save(chefOrderItem);
    return this.mapper.map(updated, ChefOrderItem, ChefOrderItemResponseDto);
  }
}
