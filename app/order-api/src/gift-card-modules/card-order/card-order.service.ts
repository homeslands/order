import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardOrderDto } from './dto/create-card-order.dto';
import { UpdateCardOrderDto } from './dto/update-card-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardOrder } from './entities/card-order.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Card } from '../card/entities/card.entity';
import { User } from 'src/user/user.entity';
import { Receipient } from '../receipient/entities/receipient.entity';
import { PaymentStatus } from 'src/payment/payment.constants';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Mapper } from '@automapper/core';
import { CardOrderResponseDto } from './dto/card-order-response.dto';

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
    private readonly mapper: Mapper,
    private readonly transactionService: TransactionManagerService,
  ) {}

  async create(createCardOrderDto: CreateCardOrderDto) {
    const context = `${CardOrderService.name}.${this.create.name}`;
    this.logger.debug(
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
        slug: createCardOrderDto.customerSlug,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const cashier = await this.userRepository.findOne({
      where: {
        slug: createCardOrderDto.cashierSlug,
      },
    });

    if (!cashier) {
      throw new NotFoundException('Cashier not found');
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

    const ReceipientPromiseSettledResult: PromiseSettledResult<
      Partial<Receipient>
    >[] = await Promise.allSettled(
      createCardOrderDto.receipients.map(async (recipient) => {
        const receipient = await this.userRepository.findOne({
          where: {
            slug: recipient.recipientSlug,
          },
        });

        if (!receipient) {
          throw new NotFoundException('Receipient not found');
        }

        const receipientItem: Partial<Receipient> = {
          quantity: recipient.quantity,
          message: recipient.message,
          status: 'pending',

          name: `${receipient.firstName} ${receipient.lastName}`,
          phone: receipient.phonenumber,
          recipientId: receipient.id,
          recipient: receipient,

          senderId: cashier.id,
          senderName: `${cashier.firstName} ${cashier.lastName}`,
          senderPhone: cashier.phonenumber,
          sender: cashier,
        };

        return receipientItem;
      }),
    );

    const receipients = ReceipientPromiseSettledResult.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
    });

    const cardOrder: Partial<CardOrder> = {
      type: createCardOrderDto.cardOrderType,
      status: 'pending',
      totalAmount,
      orderDate: new Date(),
      // sequence: '',
      quantity: totalQuantity,

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

      cashierId: cashier.id,
      cashierName: `${cashier.firstName} ${cashier.lastName}`,
      cashierPhone: cashier.phonenumber,
      cashier,

      paymentStatus: PaymentStatus.PENDING,

      receipients: receipients.filter(
        (receipient) => receipient !== undefined,
      ) as Receipient[],
    };

    const createdCardOrder = await this.transactionService.execute<CardOrder>(
      async (manager) => {
        const createdCardOrder = await manager.save(cardOrder as CardOrder);
        return createdCardOrder;
      },
      (error) => {
        this.logger.error(
          `Error creating card order: ${JSON.stringify(error)}`,
          context,
        );
        throw error;
      },
    );
    return this.mapper.map(createdCardOrder, CardOrder, CardOrderResponseDto);
  }

  findAll() {
    return `This action returns all cardOrder`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cardOrder`;
  }

  update(id: number, updateCardOrderDto: UpdateCardOrderDto) {
    return `This action updates a #${id} cardOrder`;
  }

  remove(id: number) {
    return `This action removes a #${id} cardOrder`;
  }
}
