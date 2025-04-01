import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChefOrderUtils } from './chef-order.utils';
import { ChefOrder } from './chef-order.entity';
import { OrderUtils } from 'src/order/order.utils';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  ChefOrderResponseDto,
  CreateChefOrderRequestDto,
  QueryGetAllChefOrderRequestDto,
  UpdateChefOrderRequestDto,
} from './chef-order.dto';
import _ from 'lodash';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import ChefOrderValidation from './chef-order.validation';
import { ChefOrderException } from './chef-order.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { ChefOrderStatus } from './chef-order.constants';
import { ChefOrderItemStatus } from 'src/chef-order-item/chef-order-item.constants';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import moment from 'moment';

@Injectable()
export class ChefOrderService {
  constructor(
    @InjectRepository(ChefOrder)
    private readonly chefOrderRepository: Repository<ChefOrder>,
    private readonly chefOrderUtils: ChefOrderUtils,
    private readonly orderUtils: OrderUtils,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Create a new chef order
   * @param {CreateChefOrderRequestDto} requestData - The request data
   * @returns {Promise<ChefOrderResponseDto[]>} - A promise that resolves to an array of chef order response DTOs
   * @throws {ChefOrderException} - If the chef order is not found
   */
  async create(
    requestData: CreateChefOrderRequestDto,
  ): Promise<ChefOrderResponseDto[]> {
    const context = `${ChefOrderService.name}.${this.create.name}`;

    const order = await this.orderUtils.getOrder({
      where: { slug: requestData.order },
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

  /**
   * Get all chef orders
   * @param {QueryGetAllChefOrderRequestDto} query - The query parameters
   * @returns {Promise<ChefOrderResponseDto[]>} - A promise that resolves to an array of chef order response DTOs
   */
  async getAllChefOrders(
    query: QueryGetAllChefOrderRequestDto,
  ): Promise<AppPaginatedResponseDto<ChefOrderResponseDto>> {
    // Build find options
    const findOptions: FindOptionsWhere<ChefOrder> = {
      chefArea: { slug: query.chefArea },
      status: query.status,
    };

    if (query.order) {
      findOptions.order = { slug: query.order };
    }

    if (query.startDate && !query.endDate) {
      throw new ChefOrderException(
        ChefOrderValidation.END_DATE_CAN_NOT_BE_EMPTY,
      );
    }

    if (!query.startDate && query.endDate) {
      throw new ChefOrderException(
        ChefOrderValidation.START_DATE_CAN_NOT_BE_EMPTY,
      );
    }

    if (query.startDate && query.endDate) {
      query.startDate = moment(query.startDate).startOf('day').toDate();
      query.endDate = moment(query.endDate).endOf('day').toDate();
      findOptions.createdAt = Between(query.startDate, query.endDate);
    }

    const [chefOrders, total] = await this.chefOrderRepository.findAndCount({
      where: findOptions,
      relations: [
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
        'order.table',
      ],
      order: {
        createdAt: 'ASC',
      },
      skip: (query.page - 1) * query.size,
      take: query.size,
    });

    const totalPages = Math.ceil(total / query.size);

    return {
      totalPages,
      hasPrevios: query.page > 1,
      hasNext: query.page < totalPages,
      page: query.page,
      pageSize: query.size,
      total,
      items: this.mapper.mapArray(chefOrders, ChefOrder, ChefOrderResponseDto),
    };
  }

  /**
   * Get a specific chef order by slug
   * @param {string} slug - The slug of the chef order
   * @returns {Promise<ChefOrderResponseDto>} - A promise that resolves to a chef order response DTO
   * @throws {ChefOrderException} - If the chef order is not found
   */
  async getSpecific(slug: string): Promise<ChefOrderResponseDto> {
    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { slug },
      relations: [
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
        'order.table',
      ],
    });

    return this.mapper.map(chefOrder, ChefOrder, ChefOrderResponseDto);
  }

  /**
   * Update a specific chef order
   * @param {string} slug - The slug of the chef order
   * @param {UpdateChefOrderRequestDto} requestData - The request data
   * @returns {Promise<ChefOrderResponseDto>} - A promise that resolves to a chef order response DTO
   * @throws {ChefOrderException} - If the chef order is not found
   */
  async update(
    slug: string,
    requestData: UpdateChefOrderRequestDto,
  ): Promise<ChefOrderResponseDto> {
    const context = `${ChefOrderService.name}.${this.update.name}`;

    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { slug },
      relations: ['chefOrderItems'],
    });

    if (requestData.status === ChefOrderStatus.COMPLETED) {
      const completedChefOrderItems = chefOrder.chefOrderItems.filter(
        (item) => item.status === ChefOrderItemStatus.COMPLETED,
      );

      if (
        _.size(chefOrder.chefOrderItems) !== _.size(completedChefOrderItems)
      ) {
        this.logger.warn(
          ChefOrderValidation
            .ALL_CHEF_ORDER_ITEMS_COMPLETED_TO_UPDATE_CHEF_ORDER_STATUS_COMPLETED
            .message,
          context,
        );
        throw new ChefOrderException(
          ChefOrderValidation.ALL_CHEF_ORDER_ITEMS_COMPLETED_TO_UPDATE_CHEF_ORDER_STATUS_COMPLETED,
        );
      }
    }

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
