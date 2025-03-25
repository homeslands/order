import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChefOrderItemUtils } from './chef-order-item.utils';
import {
  ChefOrderItemResponseDto,
  UpdateChefOrderItemRequestDto,
  UpdateMultiChefOrderItemRequestDto,
} from './chef-order-item.dto';
import { ChefOrderItem } from './chef-order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ChefOrderItemException } from './chef-order-item.exception';
import ChefOrderItemValidation from './chef-order-item.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import _ from 'lodash';

@Injectable()
export class ChefOrderItemService {
  constructor(
    @InjectRepository(ChefOrderItem)
    private readonly chefOrderItemRepository: Repository<ChefOrderItem>,
    private readonly chefOrderItemUtils: ChefOrderItemUtils,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
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

  async updateMulti(
    requestData: UpdateMultiChefOrderItemRequestDto,
  ): Promise<ChefOrderItemResponseDto[]> {
    const context = `${ChefOrderItemService.name}.${this.updateMulti.name}`;

    const chefOrderItems = await Promise.all(
      requestData.chefOrderItems.map(async (item) => {
        const chefOrderItem = await this.chefOrderItemUtils.getChefOrderItem({
          where: { slug: item },
          relations: ['chefOrder'],
        });
        Object.assign(chefOrderItem, { status: requestData.status });
        return chefOrderItem;
      }),
    );
    const isAllSameChefOrder = chefOrderItems.every(
      (item) => item.chefOrder.id === _.first(chefOrderItems).chefOrder.id,
    );
    if (!isAllSameChefOrder) {
      this.logger.warn(
        ChefOrderItemValidation.ALL_CHEF_ORDER_ITEMS_MUST_BE_BELONG_TO_AN_CHEF_ORDER,
        context,
      );
      throw new ChefOrderItemException(
        ChefOrderItemValidation.ALL_CHEF_ORDER_ITEMS_MUST_BE_BELONG_TO_AN_CHEF_ORDER,
      );
    }

    const updatedChefOrderItems =
      await this.chefOrderItemRepository.manager.transaction(
        async (manager) => {
          try {
            const updated = await manager.save(chefOrderItems);
            return updated;
          } catch (error) {
            this.logger.error(
              ChefOrderItemValidation.ERROR_WHEN_UPDATE_MULTI_CHEF_ORDER_ITEMS
                .message,
              error.stack,
              context,
            );
            throw new ChefOrderItemException(
              ChefOrderItemValidation.ERROR_WHEN_UPDATE_MULTI_CHEF_ORDER_ITEMS,
            );
          }
        },
      );
    return this.mapper.mapArray(
      updatedChefOrderItems,
      ChefOrderItem,
      ChefOrderItemResponseDto,
    );
  }
}
