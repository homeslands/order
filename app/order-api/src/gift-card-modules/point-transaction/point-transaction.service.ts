import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PointTransaction } from './entities/point-transaction.entity';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { PointTransactionResponseDto } from './dto/point-transaction-response.dto';
import { createSortOptions } from 'src/shared/utils/obj.util';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { PointTransactionException } from './point-transaction.exception';
import { PointTransactionValidation } from './point-transaction.validation';
import { FindAllPointTransactionDto } from './dto/find-all-point-transaction.dto';
import { CreatePointTransactionDto } from './dto/create-point-transaction.dto';
import {
  PointTransactionObjectTypeEnum,
  PointTransactionTypeEnum,
} from './entities/point-transaction.enum';
import { Order } from 'src/order/order.entity';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class PointTransactionService {
  /**
   *
   */
  constructor(
    @InjectRepository(PointTransaction)
    private ptRepository: Repository<PointTransaction>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(GiftCard)
    private gcRepository: Repository<GiftCard>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionService: TransactionManagerService,
  ) {}

  async create(req: CreatePointTransactionDto) {
    const context = `${PointTransaction.name}.${this.create.name}`;
    this.logger.log(
      `Create point transaction req; ${JSON.stringify(req)}`,
      context,
    );

    const payload = this.mapper.map(
      req,
      CreatePointTransactionDto,
      PointTransaction,
    );

    if (
      payload.type === PointTransactionTypeEnum.IN &&
      payload.objectType === PointTransactionObjectTypeEnum.ORDER
    ) {
      throw new PointTransactionException(
        PointTransactionValidation.INVALID_IN_ORDER_TRANSACTION,
      );
    }

    if (
      payload.type === PointTransactionTypeEnum.OUT &&
      payload.objectType === PointTransactionObjectTypeEnum.GIFT_CARD
    ) {
      throw new PointTransactionException(
        PointTransactionValidation.INVALID_OUT_ORDER_TRANSACTION,
      );
    }

    let objectRef: Order | GiftCard = null;

    switch (payload.objectType) {
      case PointTransactionObjectTypeEnum.ORDER:
        objectRef = await this.orderRepository.findOne({
          where: { slug: payload.objectSlug },
        });
        break;
      case PointTransactionObjectTypeEnum.GIFT_CARD:
        objectRef = await this.gcRepository.findOne({
          where: { slug: payload.objectSlug },
        });
        break;
      default:
        throw new PointTransactionException(
          PointTransactionValidation.OBJECT_TYPE_NOT_FOUND,
        );
    }

    if (!objectRef)
      throw new PointTransactionException(
        PointTransactionValidation.OBJECT_TYPE_NOT_FOUND,
      );

    const user = await this.userRepository.findOne({
      where: {
        slug: payload.userSlug,
      },
    });

    if (!user)
      throw new PointTransactionException(
        PointTransactionValidation.USER_NOT_FOUND,
      );

    Object.assign(payload, {
      objectId: objectRef.id,
      userId: user.id,
      user: user,
    } as Partial<PointTransaction>);

    const pt = await this.transactionService.execute<PointTransaction>(
      async (manager) => {
        return manager.save(payload);
      },
      (res) =>
        this.logger.log(
          `Point transaction created: ${JSON.stringify(res)}`,
          context,
        ),
      (err) => {
        this.logger.error(
          `Error when creating point transaction: ${err.message}`,
          err.stack,
          context,
        );
        throw new PointTransactionException(
          PointTransactionValidation.ERROR_WHEN_CREATE_POINT_TRANSACTION,
        );
      },
    );
    return this.mapper.map(pt, PointTransaction, PointTransactionResponseDto);
  }

  async findAll(req: FindAllPointTransactionDto) {
    const context = `${PointTransactionService.name}.${this.findAll.name}`;
    this.logger.log(
      `Find all point transaction: ${JSON.stringify(req)}`,
      context,
    );

    const { page, size, sort, userSlug } = req;

    const whereOpts: FindOptionsWhere<PointTransaction> = {};
    if (userSlug) {
      whereOpts.user = {
        slug: userSlug,
      };
    }
    const sortOpts = createSortOptions<PointTransaction>(sort);

    const [pts, total] = await this.ptRepository.findAndCount({
      where: whereOpts,
      order: sortOpts,
      take: size,
      skip: (page - 1) * size,
      relations: ['user'],
    });
    const cardsResponse = this.mapper.mapArray(
      pts,
      PointTransaction,
      PointTransactionResponseDto,
    );
    // Calculate total pages
    const totalPages = Math.ceil(total / size);
    // Determine hasNext and hasPrevious
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: cardsResponse,
      total,
      page: page,
      pageSize: size,
      totalPages,
    } as AppPaginatedResponseDto<PointTransactionResponseDto>;
  }

  async findOne(slug: string) {
    const context = `${PointTransactionService.name}.${this.findOne.name}`;
    this.logger.log(`Find point transaction: ${JSON.stringify(slug)}`, context);

    const pt = await this.ptRepository.findOne({
      where: {
        slug: slug ?? IsNull(),
      },
      relations: ['user'],
    });
    if (!pt)
      throw new PointTransactionException(
        PointTransactionValidation.POINT_TRANSACTION_NOT_FOUND,
      );
    return this.mapper.map(pt, PointTransaction, PointTransactionResponseDto);
  }
}
