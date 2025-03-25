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
import { ChefOrderUtils } from 'src/chef-order/chef-order.utils';
import { ChefOrderStatus } from 'src/chef-order/chef-order.constants';

@Injectable()
export class ChefOrderItemService {
  constructor(
    @InjectRepository(ChefOrderItem)
    private readonly chefOrderItemRepository: Repository<ChefOrderItem>,
    private readonly chefOrderItemUtils: ChefOrderItemUtils,
    private readonly chefOrderUtils: ChefOrderUtils,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async update(
    slug: string,
    requestData: UpdateChefOrderItemRequestDto,
  ): Promise<ChefOrderItemResponseDto> {
    const context = `${ChefOrderItemService.name}.${this.update.name}`;

    const chefOrderItem = await this.chefOrderItemUtils.getChefOrderItem({
      where: { slug },
      relations: ['chefOrder'],
    });

    if (chefOrderItem.chefOrder?.status !== ChefOrderStatus.ACCEPTED) {
      this.logger.warn(
        ChefOrderItemValidation
          .ONLY_UPDATE_CHEF_ORDER_ITEM_STATUS_WHEN_CHEF_ORDER_STATUS_IS_ACCEPTED
          .message,
        context,
      );
      throw new ChefOrderItemException(
        ChefOrderItemValidation.ONLY_UPDATE_CHEF_ORDER_ITEM_STATUS_WHEN_CHEF_ORDER_STATUS_IS_ACCEPTED,
      );
    }
    Object.assign(chefOrderItem, { status: requestData.status });
    const updated = await this.chefOrderItemRepository.save(chefOrderItem);
    await this.chefOrderUtils.updateChefOrderStatus(chefOrderItem.slug);
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

    if (
      _.first(chefOrderItems)?.chefOrder?.status !== ChefOrderStatus.ACCEPTED
    ) {
      this.logger.warn(
        ChefOrderItemValidation
          .ONLY_UPDATE_CHEF_ORDER_ITEM_STATUS_WHEN_CHEF_ORDER_STATUS_IS_ACCEPTED
          .message,
        context,
      );
      throw new ChefOrderItemException(
        ChefOrderItemValidation.ONLY_UPDATE_CHEF_ORDER_ITEM_STATUS_WHEN_CHEF_ORDER_STATUS_IS_ACCEPTED,
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
    await this.chefOrderUtils.updateChefOrderStatus(
      _.first(updatedChefOrderItems).slug,
    );
    return this.mapper.mapArray(
      updatedChefOrderItems,
      ChefOrderItem,
      ChefOrderItemResponseDto,
    );
  }
}
