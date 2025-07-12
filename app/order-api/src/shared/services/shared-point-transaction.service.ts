import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Order } from 'src/order/order.entity';
import { User } from 'src/user/user.entity';
import { CreatePointTransactionDto } from 'src/gift-card-modules/point-transaction/dto/create-point-transaction.dto';
import { PointTransaction } from 'src/gift-card-modules/point-transaction/entities/point-transaction.entity';
import { GiftCard } from 'src/gift-card-modules/gift-card/entities/gift-card.entity';
import {
  PointTransactionObjectTypeEnum,
  PointTransactionTypeEnum,
} from 'src/gift-card-modules/point-transaction/entities/point-transaction.enum';
import { PointTransactionValidation } from 'src/gift-card-modules/point-transaction/point-transaction.validation';
import { PointTransactionException } from 'src/gift-card-modules/point-transaction/point-transaction.exception';

@Injectable()
export class SharedPointTransactionService {
  /**
   *
   */
  constructor(
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
    return pt;
  }
}
