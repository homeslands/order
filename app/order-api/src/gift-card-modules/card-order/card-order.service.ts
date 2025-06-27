import { CreateRecipientDto } from 'src/gift-card-modules/receipient/dto/create-recipient.dto';
import { Recipient } from 'src/gift-card-modules/receipient/entities/receipient.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateCardOrderDto } from './dto/create-card-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { CardOrder } from './entities/card-order.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Card } from '../card/entities/card.entity';
import { User } from 'src/user/user.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Mapper } from '@automapper/core';
import { CardOrderResponseDto } from './dto/card-order-response.dto';
import { FindAllCardOrderDto } from './dto/find-all-card-order.dto';
import { InjectMapper } from '@automapper/nestjs';
import { CardOrderException } from './card-order.exception';
import { CardOrderValidation } from './card-order.validation';
import { CardOrderStatus, CardOrderType } from './card-order.enum';
import { createSortOptions } from 'src/shared/utils/obj.util';
import { OrderException } from 'src/order/order.exception';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { InitiateCardOrderPaymentDto } from './dto/initiate-card-order-payment.dto';
import { CardException } from '../card/card.exception';
import { CardValidation } from '../card/card.validation';
import { GiftCardService } from '../gift-card/gift-card.service';
import { PointTransactionService } from '../point-transaction/point-transaction.service';
import { BalanceService } from '../balance/balance.service';
import {
  PointTransactionObjectTypeEnum,
  PointTransactionTypeEnum,
} from '../point-transaction/entities/point-transaction.enum';
import { CreatePointTransactionDto } from '../point-transaction/dto/create-point-transaction.dto';
import { UseGiftCardDto } from '../gift-card/dto/use-gift-card.dto';
import _ from 'lodash';

@Injectable()
export class CardOrderService {
  constructor(
    @InjectRepository(CardOrder)
    private cardOrderRepository: Repository<CardOrder>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionService: TransactionManagerService,
    private readonly bankTransferStrategy: BankTransferStrategy,
    private readonly gcService: GiftCardService,
    private readonly ptService: PointTransactionService,
    private readonly balanceService: BalanceService,
  ) {}

  async initiatePayment(payload: InitiateCardOrderPaymentDto) {
    const context = `${CardOrderService.name}.${this.initiatePayment.name}`;
    this.logger.log(`Initiate a payment: ${payload}`, context);

    const cardOrder = await this.cardOrderRepository.findOne({
      where: { slug: payload.cardorderSlug ?? IsNull() },
      relations: ['payment'],
    });
    if (!cardOrder)
      throw new CardOrderException(CardOrderValidation.CARD_ORDER_NOT_FOUND);

    if (cardOrder.status !== CardOrderStatus.PENDING)
      throw new OrderException(CardOrderValidation.CARD_ORDER_NOT_PENDING);

    if (cardOrder.payment)
      return this.mapper.map(cardOrder, CardOrder, CardOrderResponseDto);

    const payment = await this.bankTransferStrategy.processCardOrder(cardOrder);

    // Update card order
    cardOrder.payment = payment;
    Object.assign(cardOrder, {
      payment,
      paymentMethod: payment.paymentMethod,
      paymentId: payment.id,
      paymentSlug: payment.slug,
    } as Partial<CardOrder>);

    await this.cardOrderRepository.save(cardOrder);
    this.transactionService.execute<CardOrder>(
      async (manager) => {
        return await manager.save(cardOrder);
      },
      (result) => {
        this.logger.log(`Card order payment: ${result.slug} updated`, context);
      },
      (err) => {
        this.logger.log(
          `Error when updating card order: ${err.message}`,
          err.stack,
          context,
        );
      },
    );

    return this.mapper.map(cardOrder, CardOrder, CardOrderResponseDto);
  }

  async cancel(slug: string): Promise<void> {
    const context = `${CardOrderService.name}.${this.cancel.name}`;
    this.logger.log(`Cancelling card order: ${slug}`, context);

    const cardOrder = await this.cardOrderRepository.findOne({
      where: { slug },
    });

    if (!cardOrder) {
      throw new CardOrderException(CardOrderValidation.CARD_ORDER_NOT_FOUND);
    }

    if (cardOrder.status !== CardOrderStatus.PENDING) {
      throw new CardOrderException(CardOrderValidation.CARD_ORDER_NOT_PENDING);
    }

    Object.assign(cardOrder, {
      status: CardOrderStatus.CANCELLED,
      deletedAt: new Date(),
    });
    await this.cardOrderRepository.save(cardOrder);
  }

  async create(createCardOrderDto: CreateCardOrderDto) {
    const context = `${CardOrderService.name}.${this.create.name}`;
    this.logger.log(
      `Creating card order: ${JSON.stringify(createCardOrderDto)}`,
      context,
    );

    const card = await this.cardRepository.findOne({
      where: {
        slug: createCardOrderDto.cardSlug,
      },
    });

    if (!card) {
      throw new CardException(CardValidation.CARD_NOT_FOUND);
    }

    if (!card.isActive) {
      throw new CardOrderException(CardOrderValidation.CARD_IS_NOT_ACTIVE)
    }

    const customer = await this.userRepository.findOne({
      where: {
        slug: createCardOrderDto.customerSlug || IsNull(),
      },
    });

    if (!customer) {
      throw new CardOrderException(
        CardOrderValidation.CARD_ORDER_CUSTOMER_NOT_FOUND,
      );
    }

    const cashier = await this.userRepository.findOne({
      where: {
        slug: createCardOrderDto.cashierSlug || IsNull(),
      },
    });

    if (!cashier) {
      this.logger.warn('Cashier not found', context);
    }

    const totalAmount = card.price * createCardOrderDto.quantity;
    if (totalAmount !== createCardOrderDto.totalAmount) {
      throw new CardOrderException(
        CardOrderValidation.CARD_ORDER_TOTAL_AMOUNT_NOT_CORRECT,
      );
    }

    const totalQuantity = createCardOrderDto.receipients.reduce(
      (acc, recipient) => {
        return acc + recipient.quantity;
      },
      0,
    );

    if (totalQuantity > createCardOrderDto.quantity) {
      throw new CardOrderException(
        CardOrderValidation.CARD_ORDER_TOTAL_QUANTITY_NOT_CORRECT,
      );
    }

    const receipients: Recipient[] = await Promise.all(
      createCardOrderDto.receipients.map(async (createReceipientDto) => {
        const receipient = await this.userRepository.findOne({
          where: {
            slug: createReceipientDto.recipientSlug,
          },
        });

        if (!receipient) {
          throw new CardOrderException(
            CardOrderValidation.CARD_ORDER_RECIPIENT_NOT_FOUND,
          );
        }

        const receipientItem = this.mapper.map(
          createReceipientDto,
          CreateRecipientDto,
          Recipient,
        );

        Object.assign(receipientItem, {
          name: `${receipient.firstName} ${receipient.lastName}`,
          phone: receipient.phonenumber,
          recipientId: receipient.id,
          recipientSlug: receipient.slug,
          recipient: receipient,

          senderId: customer.id,
          senderSlug: customer.slug,
          senderName: `${customer.firstName} ${customer.lastName}`,
          senderPhone: customer.phonenumber,
          sender: customer,
        } as Partial<Recipient>);

        return receipientItem;
      }),
    );

    const cardOrder = this.mapper.map(
      createCardOrderDto,
      CreateCardOrderDto,
      CardOrder,
    );

    Object.assign(cardOrder, {
      type: createCardOrderDto.cardOrderType,

      cardId: card.id,
      cardSlug: card.slug,
      cardPoint: card.points,
      cardTitle: card.title,
      cardImage: card.image,
      cardPrice: card.price,
      card,

      customerId: customer.id,
      customerSlug: customer.slug,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: customer.phonenumber,
      customer,

      cashierId: cashier ? cashier.id : null,
      cashierSlug: cashier ? cashier.slug : null,
      cashierName: cashier ? `${cashier.firstName} ${cashier.lastName}` : null,
      cashierPhone: cashier ? cashier.phonenumber : null,
      cashier: cashier ? cashier : null,
    } as Partial<CardOrder>);

    const createdCardOrder = await this.transactionService.execute<CardOrder>(
      async (manager) => {
        const createdCardOrder = await manager.save(cardOrder as CardOrder);

        receipients.forEach((item: Recipient) => {
          item.cardOrder = createdCardOrder;
          item.cardOrderSlug = createdCardOrder.slug;
          item.cardOrderId = createdCardOrder.id;
        });

        await manager.save(receipients);
        return createdCardOrder;
      },
      (result) => {
        this.logger.log(
          `Created card order: ${JSON.stringify(result)}`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Error creating card order: ${JSON.stringify(error)}`,
          error.stack,
          context,
        );
        throw error;
      },
    );
    return this.mapper.map(createdCardOrder, CardOrder, CardOrderResponseDto);
  }

  async findAll(payload: FindAllCardOrderDto) {
    const context = `${CardOrderService.name}.${this.findAll.name}`;
    this.logger.log(`Find all card order: ${JSON.stringify(payload)}`, context);

    const { page, size, sort } = payload;

    const whereOpts: FindOptionsWhere<CardOrder> = {};
    if (payload.customerSlug) {
      whereOpts.customer = {
        slug: payload.customerSlug,
      };
    }
    const sortOpts = createSortOptions<CardOrder>(sort);

    const cardOrders = await this.cardOrderRepository.find({
      relations: ['receipients', 'giftCards'],
      where: whereOpts,
      order: sortOpts,
      take: size,
      skip: (page - 1) * size,
    });

    return this.mapper.mapArray(cardOrders, CardOrder, CardOrderResponseDto);
  }

  async findOne(slug: string) {
    const context = `${CardOrderService.name}.${this.findOne.name}`;
    this.logger.log(`Find one card order: ${slug}`, context);

    const cardOrder = await this.cardOrderRepository.findOne({
      where: {
        slug,
      },
      relations: ['receipients', 'giftCards'],
    });
    if (!cardOrder) {
      throw new CardOrderException(CardOrderValidation.CARD_ORDER_NOT_FOUND);
    }
    return this.mapper.map(cardOrder, CardOrder, CardOrderResponseDto);
  }

  async generateAndRedeem(slug: string) {
    const co = await this.cardOrderRepository.findOne({
      where: { slug },
      relations: ['receipients', 'giftCards'],
    });
    if (!co)
      throw new CardOrderException(CardOrderValidation.CARD_ORDER_NOT_FOUND);

    if (co.status === CardOrderStatus.COMPLETED && _.isEmpty(co.giftCards))
      await this._generateAndRedeem(co);
    else
      throw new CardOrderException(
        CardOrderValidation.GIFT_CARD_HAS_ALREADY_GENERATED,
      );
  }

  async _generateAndRedeem(databaseEntity: CardOrder) {
    const context = `${CardOrderService.name}.${this._generateAndRedeem.name}`;
    this.logger.log(`handle card payment order success req`, context);

    switch (databaseEntity.type) {
      case CardOrderType.GIFT:
        for (const item of databaseEntity.receipients) {
          const { recipientSlug, quantity } = item;
          let totalAmount = 0;
          for (let i = 0; i < quantity; i++) {
            // Gen
            const gc = await this.gcService.gen({
              cardOrderSlug: databaseEntity.slug,
              cardSlug: databaseEntity.cardSlug,
            });

            // 2. Auto-redeem
            await this.gcService.redeem({
              code: gc.code,
              serial: gc.serial,
              userSlug: recipientSlug,
            } as UseGiftCardDto);

            // 3. Create transaction record
            await this.ptService.create({
              type: PointTransactionTypeEnum.IN,
              desc: `Nap the qua tang ${databaseEntity.cardPoint} xu`,
              objectType: PointTransactionObjectTypeEnum.GIFT_CARD,
              objectSlug: gc.slug,
              points: databaseEntity.cardPoint,
              userSlug: recipientSlug,
            } as CreatePointTransactionDto);
            totalAmount += databaseEntity.cardPoint;
          }

          // 4. Update recipient balance ONCE after all cards
          totalAmount += databaseEntity.cardPoint;
          await this.balanceService.calcBalance({
            userSlug: recipientSlug,
            points: totalAmount,
            type: PointTransactionTypeEnum.IN,
          });
        }
        break;
      case CardOrderType.SELF:
        let totalAmount = 0;
        for (let i = 0; i < databaseEntity.quantity; i++) {
          // Gen
          const gc = await this.gcService.gen({
            cardOrderSlug: databaseEntity.slug,
            cardSlug: databaseEntity.cardSlug,
          });

          // 2. Auto-redeem
          await this.gcService.redeem({
            code: gc.code,
            serial: gc.serial,
            userSlug: databaseEntity.customerSlug,
          } as UseGiftCardDto);

          // 3. Create transaction record
          await this.ptService.create({
            type: PointTransactionTypeEnum.IN,
            desc: `Nap the qua tang ${databaseEntity.cardPoint} xu`,
            objectType: PointTransactionObjectTypeEnum.GIFT_CARD,
            objectSlug: gc.slug,
            points: databaseEntity.cardPoint,
            userSlug: databaseEntity.customerSlug,
          } as CreatePointTransactionDto);
          totalAmount += databaseEntity.cardPoint;
        }

        // 4. Update recipient balance ONCE after all cards
        totalAmount += databaseEntity.cardPoint;
        await this.balanceService.calcBalance({
          userSlug: databaseEntity.customerSlug,
          points: totalAmount,
          type: PointTransactionTypeEnum.IN,
        });
        break;
      case CardOrderType.BUY:
        // Just create gift cards
        await this.gcService.bulkGen({
          quantity: databaseEntity.quantity,
          cardSlug: databaseEntity.cardSlug,
          cardOrderSlug: databaseEntity.slug,
        });
        break;
      default:
        break;
    }
  }
}
