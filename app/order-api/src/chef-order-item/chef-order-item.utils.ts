import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import ChefOrderItemValidation from './chef-order-item.validation';
import { ChefOrderItemException } from './chef-order-item.exception';

@Injectable()
export class ChefOrderItemUtils {
  constructor(
    @InjectRepository(ChefOrderItem)
    private readonly chefOrderItemRepository: Repository<ChefOrderItem>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getChefOrderItem(
    options: FindOneOptions<ChefOrderItem>,
  ): Promise<ChefOrderItem> {
    const context = `${ChefOrderItemUtils.name}.${this.getChefOrderItem.name}`;

    const chefOrderItem = await this.chefOrderItemRepository.findOne({
      ...options,
    });
    if (!chefOrderItem) {
      this.logger.warn(
        ChefOrderItemValidation.CHEF_ORDER_ITEM_NOT_FOUND.message,
        context,
      );
      throw new ChefOrderItemException(
        ChefOrderItemValidation.CHEF_ORDER_ITEM_NOT_FOUND,
      );
    }

    return chefOrderItem;
  }
}
