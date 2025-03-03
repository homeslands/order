import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { TrackingOrderItem } from './tracking-order-item.entity';

@Injectable()
export class TrackingOrderItemService {
  constructor(
    @InjectRepository(TrackingOrderItem)
    private readonly trackingOrderItemRepository: Repository<TrackingOrderItem>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  // async createTracking (
  //   requestData: CreateTrackingRequestDto
  // ): Promise
}
