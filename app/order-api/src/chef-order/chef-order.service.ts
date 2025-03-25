import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChefOrderUtils } from './chef-order.utils';
import { ChefOrder } from './chef-order.entity';
import { OrderUtils } from 'src/order/order.utils';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  ChefOrderResponseDto,
  QueryGetChefOrderRequestDto,
  UpdateChefOrderRequestDto,
} from './chef-order.dto';
import _ from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import ChefOrderValidation from './chef-order.validation';
import { ChefOrderException } from './chef-order.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { ChefArea } from 'src/chef-area/chef-area.entity';
import { Repository } from 'typeorm';
import { ChefAreaException } from 'src/chef-area/chef-area.exception';
import ChefAreaValidation from 'src/chef-area/chef-area.validation';
import { BranchUtils } from 'src/branch/branch.utils';
import { ChefAreaUtils } from 'src/chef-area/chef-area.utils';
import { ChefAreaResponseDto } from 'src/chef-area/chef-area.dto';
import { ChefOrderStatus } from './chef-order.constants';

@Injectable()
export class ChefOrderService {
  constructor(
    @InjectRepository(ChefArea)
    private readonly chefAreaRepository: Repository<ChefArea>,
    @InjectRepository(ChefOrder)
    private readonly chefOrderRepository: Repository<ChefOrder>,
    private readonly chefOrderUtils: ChefOrderUtils,
    private readonly chefAreaUtils: ChefAreaUtils,
    private readonly branchUtils: BranchUtils,
    private readonly orderUtils: OrderUtils,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(orderSlug: string): Promise<ChefOrderResponseDto[]> {
    const context = `${ChefOrderService.name}.${this.create.name}`;
    const order = await this.orderUtils.getOrder({
      where: { slug: orderSlug },
    });
    if (!_.isEmpty(order.chefOrders)) {
      this.logger.warn(
        ChefOrderValidation.CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER.message,
        context,
      );
      throw new ChefOrderException(
        ChefOrderValidation.CHEF_ORDERS_ALREADY_EXIST_FROM_THIS_ORDER,
      );
    }

    const chefOrders: ChefOrder[] = await this.chefOrderUtils.createChefOrder(
      order.id,
    );

    return this.mapper.mapArray(chefOrders, ChefOrder, ChefOrderResponseDto);
  }

  async getAllGroupByChefArea(
    query: QueryGetChefOrderRequestDto,
  ): Promise<ChefAreaResponseDto[]> {
    const context = `${ChefOrderService.name}.${this.getAllGroupByChefArea.name}`;

    let chefAreas: ChefArea[] = [];
    if (query.branch) {
      const branch = await this.branchUtils.getBranch({
        where: {
          slug: query.branch,
        },
        relations: [
          'chefAreas.chefOrders.chefOrderItems.orderItem.variant.size',
          'chefAreas.chefOrders.chefOrderItems.orderItem.variant.product',
          'chefAreas.chefOrders.order',
        ],
      });

      if (_.isEmpty(branch.chefAreas)) {
        this.logger.warn(
          `Not found any chef areas for branch ${query.branch}`,
          context,
        );
        throw new ChefAreaException(
          ChefAreaValidation.NOT_FOUND_ANY_CHEF_AREAS_IN_THIS_BRANCH,
        );
      }

      if (query.status) {
        chefAreas = branch.chefAreas.map((chefArea) => ({
          ...chefArea,
          chefOrders: chefArea.chefOrders.filter(
            (order) => order.status === query.status,
          ),
        }));
      } else {
        chefAreas = branch.chefAreas;
      }
    }

    if (query.chefArea) {
      const chefArea = await this.chefAreaUtils.getChefArea({
        where: { slug: query.chefArea },
        relations: [
          'chefOrders.chefOrderItems.orderItem.variant.size',
          'chefOrders.chefOrderItems.orderItem.variant.product',
          'chefOrders.order',
        ],
      });
      chefAreas = [chefArea];

      if (query.status) {
        chefAreas = chefAreas.map((chefArea) => ({
          ...chefArea,
          chefOrders: chefArea.chefOrders.filter(
            (order) => order.status === query.status,
          ),
        }));
      }
    }

    if (!query.branch || !query.chefArea) {
      chefAreas = await this.chefAreaRepository.find({
        relations: [
          'chefOrders.chefOrderItems.orderItem.variant.size',
          'chefOrders.chefOrderItems.orderItem.variant.product',
          'chefOrders.order',
          'branch',
        ],
      });

      if (query.status) {
        chefAreas = chefAreas.map((chefArea) => ({
          ...chefArea,
          chefOrders: chefArea.chefOrders.filter(
            (order) => order.status === query.status,
          ),
        }));
      }
    }
    return this.mapper.mapArray(chefAreas, ChefArea, ChefAreaResponseDto);
  }

  async getSpecific(slug: string): Promise<ChefOrderResponseDto> {
    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { slug },
      relations: [
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
      ],
    });

    return this.mapper.map(chefOrder, ChefOrder, ChefOrderResponseDto);
  }

  async update(
    slug: string,
    requestData: UpdateChefOrderRequestDto,
  ): Promise<ChefOrderResponseDto> {
    const context = `${ChefOrderService.name}.${this.update.name}`;

    if (requestData.status === ChefOrderStatus.COMPLETED) {
      this.logger.warn(
        ChefOrderValidation.CHEF_ORDER_STATUS_EXCEPT_COMPLETED.message,
        context,
      );
      throw new ChefOrderException(
        ChefOrderValidation.CHEF_ORDER_STATUS_EXCEPT_COMPLETED,
      );
    }

    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { slug },
    });

    if (chefOrder.status !== ChefOrderStatus.PENDING) {
      if (requestData.status === ChefOrderStatus.PENDING) {
        this.logger.warn(
          ChefOrderValidation.CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING
            .message,
          context,
        );
        throw new ChefOrderException(
          ChefOrderValidation.CHEF_ORDER_STATUS_CAN_NOT_CHANGE_TO_PENDING,
        );
      }
    }

    Object.assign(chefOrder, { status: requestData.status });
    const updated = await this.chefOrderRepository.save(chefOrder);
    return this.mapper.map(updated, ChefOrder, ChefOrderResponseDto);
  }
}
