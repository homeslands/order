import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardOrderDto } from './dto/create-card-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CardOrder } from './entities/card-order.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Card } from '../card/entities/card.entity';
import { User } from 'src/user/user.entity';
import { Receipient } from '../receipient/entities/receipient.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Mapper } from '@automapper/core';
import { CardOrderResponseDto } from './dto/card-order-response.dto';
import { FindAllCardOrderDto } from './dto/find-all-card-order.dto';
import { InjectMapper } from '@automapper/nestjs';
import { CreateReceipientDto } from '../receipient/dto/create-receipient.dto';
import { GiftCard } from '../gift-card/entities/gift-card.entity';
import { v4 as uuidv4 } from 'uuid';

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
  ) { }

  async create(createCardOrderDto: CreateCardOrderDto) {
    const context = `${CardOrderService.name}.${this.create.name}`;
    console.log({ createCardOrderDto, receipients: createCardOrderDto.receipients });
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
      throw new NotFoundException('Card not found');
    }

    const customer = await this.userRepository.findOne({
      where: {
        slug: createCardOrderDto.customerSlug || IsNull(),
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const cashier = await this.userRepository.findOne({
      where: {
        slug: createCardOrderDto.cashierSlug || IsNull(),
      },
    });

    if (!cashier) {
      this.logger.warn('Cashier not found', context);
      // throw new NotFoundException('Cashier not found');
    }

    const totalAmount = card.price * createCardOrderDto.quantity;
    if (totalAmount !== createCardOrderDto.totalAmount) {
      throw new BadRequestException('Total amount is not correct');
    }

    const totalQuantity = createCardOrderDto.receipients.reduce(
      (acc, recipient) => {
        return acc + recipient.quantity;
      },
      0,
    );

    if (totalQuantity > createCardOrderDto.quantity) {
      throw new BadRequestException('Total quantity is not correct');
    }

    const receipients: Receipient[] = await Promise.all(
      createCardOrderDto.receipients.map(async (createReceipientDto) => {
        const receipient = await this.userRepository.findOne({
          where: {
            slug: createReceipientDto.recipientSlug,
          },
        });

        if (!receipient) {
          throw new NotFoundException(`Receipient ${createReceipientDto.recipientSlug} not found`);
        }

        const receipientItem = this.mapper.map(createReceipientDto, CreateReceipientDto, Receipient);

        Object.assign(receipientItem, {
          status: 'pending',

          name: `${receipient.firstName} ${receipient.lastName}`,
          phone: receipient.phonenumber,
          recipientId: receipient.id,
          recipient: receipient,

          senderId: customer.id,
          senderName: `${customer.firstName} ${customer.lastName}`,
          senderPhone: customer.phonenumber,
          sender: customer
        } as Partial<Receipient>);

        return receipientItem;
      }),
    );

    const giftCards: GiftCard[] = await Promise.all(
      Array.from({ length: createCardOrderDto.quantity }).map(async (item) => {
        const giftCard = new GiftCard();
        Object.assign(giftCard, {
          cardPoints: card.points,
          cardName: card.title,
          status: 'available',
          serial: uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase(),
          code: uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase(),
        } as Partial<GiftCard>);
        return giftCard;
      }),
    );

    const cardOrder = this.mapper.map(createCardOrderDto, CreateCardOrderDto, CardOrder);

    Object.assign(cardOrder, {
      type: createCardOrderDto.cardOrderType,
      status: 'pending',

      cardId: card.id,
      cardPoint: card.points,
      cardTitle: card.title,
      cardImage: card.image,
      cardPrice: card.price,
      card,

      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: customer.phonenumber,
      customer,

      cashierId: cashier ? cashier.id : null,
      cashierName: cashier ? `${cashier.firstName} ${cashier.lastName}` : null,
      cashierPhone: cashier ? cashier.phonenumber : null,
      cashier: cashier ? cashier : null,

    } as Partial<CardOrder>);

    const createdCardOrder = await this.transactionService.execute<CardOrder>(
      async (manager) => {
        const createdCardOrder = await manager.save(cardOrder as CardOrder);

        receipients.forEach((item: Receipient) => {
          item.cardOrder = createdCardOrder;
          item.cardOrderId = createdCardOrder.id;
        });

        giftCards.forEach((item: GiftCard) => {
          item.cardOrder = createdCardOrder;
          item.cardOrderId = createdCardOrder.id;
        });


        await manager.save(receipients);
        await manager.save(giftCards);

        // createdCardOrder.receipients = receipients;
        // createdCardOrder.giftCards = giftCards;
        return createdCardOrder;
      },
      (result) => {
        this.logger.log(`Created card order: ${JSON.stringify(result)}`, context);
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

    const cardOrders = await this.cardOrderRepository.find({
      relations: ['receipients', 'giftCards'],
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
      throw new NotFoundException('Card order not found');
    }
    return this.mapper.map(cardOrder, CardOrder, CardOrderResponseDto);
  }
}
