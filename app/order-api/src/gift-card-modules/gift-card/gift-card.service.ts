import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GiftCard } from './entities/gift-card.entity';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { GiftCardException } from './gift-card.exception';
import { GiftCardValidation } from './gift-card.validation';
import { GiftCardResponseDto } from './dto/gift-card-response.dto';

@Injectable()
export class GiftCardService {
  constructor(
    @InjectRepository(GiftCard)
    private gcRepository: Repository<GiftCard>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionService: TransactionManagerService,
  ) {}

  async findOne(slug: string) {
    const gc = await this.gcRepository.findOne({
      where: {
        slug,
      },
      relations: ['cardOrder.card'],
    });
    if (!gc)
      throw new GiftCardException(GiftCardValidation.GIFT_CARD_NOT_FOUND);

    return this.mapper.map(gc, GiftCard, GiftCardResponseDto);
  }

  async findAll() {
    const gcs = await this.gcRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
    return this.mapper.mapArray(gcs, GiftCard, GiftCardResponseDto);
  }
}
