import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GiftCard } from './entities/gift-card.entity';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GiftCardException } from './gift-card.exception';
import { GiftCardValidation } from './gift-card.validation';
import { UseGiftCardDto } from './dto/use-gift-card.dto';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { GiftCardStatus } from './gift-card.enum';
import { Card } from '../card/entities/card.entity';
import { CardException } from '../card/card.exception';
import { CardValidation } from '../card/card.validation';
import { GiftCardUtil } from './gift-card.utill';
import { CardOrder } from '../card-order/entities/card-order.entity';
import { CardOrderException } from '../card-order/card-order.exception';
import { CardOrderValidation } from '../card-order/card-order.validation';
import { GenGiftCardDto } from './dto/gen-gift-card.dto';
import { GiftCardResponseDto } from './dto/gift-card-response.dto';
import { CreateGiftCardDto } from './dto/create-gift-card.dto';
import { User } from 'src/user/user.entity';
import { PointTransactionService } from '../point-transaction/point-transaction.service';
import {
  PointTransactionObjectTypeEnum,
  PointTransactionTypeEnum,
} from '../point-transaction/entities/point-transaction.enum';
import { CreatePointTransactionDto } from '../point-transaction/dto/create-point-transaction.dto';
import { BalanceService } from '../balance/balance.service';
import moment from 'moment';
import { AuthException } from 'src/auth/auth.exception';
import { AuthValidation } from 'src/auth/auth.validation';

@Injectable()
export class GiftCardService {
  private readonly EXPIRES_DATE = 6; // expires end of the day 6 months later

  /**
   *
   */
  constructor(
    @InjectRepository(GiftCard)
    private readonly gcRepository: Repository<GiftCard>,
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(CardOrder)
    private readonly coRepository: Repository<CardOrder>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionService: TransactionManagerService,
    private readonly balanceService: BalanceService,
    private readonly ptService: PointTransactionService,
  ) {}

  async use(req: UseGiftCardDto) {
    const context = `${GiftCardService.name}.${this.use.name}`;
    this.logger.log(`Use gift card req: ${JSON.stringify(req)}`, context);

    // 2. Auto-redeem
    const gc = await this.redeem(req);

    // 3. Create transaction record
    await this.ptService.create({
      type: PointTransactionTypeEnum.IN,
      desc: `Nap the qua tang ${gc.cardPoints.toLocaleString()} xu`,
      objectType: PointTransactionObjectTypeEnum.GIFT_CARD,
      objectSlug: gc.slug,
      points: gc.cardPoints,
      userSlug: gc.usedBySlug,
    } as CreatePointTransactionDto);

    // 4. Update recipient balance ONCE after all cards
    await this.balanceService.calcBalance({
      userSlug: gc.usedBySlug,
      points: gc.cardPoints,
      type: PointTransactionTypeEnum.IN,
    });

    return this.mapper.map(gc, GiftCard, GiftCardResponseDto);
  }

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

  // async create(payload: CreateGiftCardDto) {
  //   const card = await this.cardRepository.findOne({
  //     where: {
  //       slug: payload.cardSlug
  //     }
  //   })
  //   if (!card) throw new CardException(CardValidation.CARD_NOT_FOUND);

  //   const co = await this.coRepository.findOne({
  //     where: {
  //       slug: payload.cardOrderSlug
  //     }
  //   })
  //   if (!co) throw new CardOrderException(CardOrderValidation.CARD_ORDER_NOT_FOUND);

  //   const gc = this.buildGiftCard(co, card);

  //   return this.mapper.map(gc, GiftCard, GiftCardResponseDto);
  // }

  async redeem(payload: UseGiftCardDto) {
    const context = `${GiftCardService.name}.${this.redeem.name}`;
    this.logger.log(`Use gift card ${JSON.stringify(payload)}`, context);

    const user = await this.userRepository.findOne({
      where: {
        slug: payload.userSlug,
      },
    });
    if (!user) throw new AuthException(AuthValidation.USER_NOT_FOUND);

    const gc = await this.gcRepository.findOne({
      where: {
        code: payload.code,
        serial: payload.serial,
      },
    });
    if (!gc)
      throw new GiftCardException(GiftCardValidation.GIFT_CARD_NOT_FOUND);

    if (gc.status === GiftCardStatus.USED)
      throw new GiftCardException(GiftCardValidation.GC_USED);

    if (gc.status === GiftCardStatus.EXPIRED)
      throw new GiftCardException(GiftCardValidation.GC_EXPIRED);

    Object.assign(gc, {
      usedAt: moment().toDate(),
      usedById: user.id,
      usedBySlug: user.slug,
      usedBy: user,
      status: GiftCardStatus.USED,
    } as Partial<GiftCard>);

    // TODO: Need checksum before updating status

    return await this.transactionService.execute<GiftCard>(
      async (manager) => {
        return await manager.save(gc);
      },
      (result) =>
        this.logger.log(`Use gift card success ${result?.slug}`, context),
      (error) => {
        this.logger.error(
          `Error when using gift card: ${error.message}`,
          error.stack,
          context,
        );
        throw new GiftCardException(
          GiftCardValidation.ERROR_WHEN_USE_GIFT_CARD,
        );
      },
    );
  }

  async gen(payload: CreateGiftCardDto) {
    const context = `${GiftCardService.name}.${this.gen.name}`;
    this.logger.log(`Gen gift card req: ${JSON.stringify(payload)}`, context);

    const card = await this.cardRepository.findOne({
      where: {
        slug: payload.cardSlug,
      },
    });

    if (!card) throw new CardException(CardValidation.CARD_NOT_FOUND);

    if (!card.isActive)
      throw new CardException(CardValidation.CARD_IS_NOT_ACTIVE);

    const co = await this.coRepository.findOne({
      where: {
        slug: payload.cardOrderSlug,
      },
    });
    if (!co)
      throw new CardOrderException(CardOrderValidation.CARD_ORDER_NOT_FOUND);

    const gc = this.buildGiftCard(co, card);

    return await this.transactionService.execute<GiftCard>(
      async (manager) => {
        return await manager.save(manager.create(GiftCard, gc));
      },
      (result) =>
        this.logger.log(
          `Gen gift card success: ${JSON.stringify(result)}`,
          context,
        ),
      (error) => {
        this.logger.error(
          `Error when gen gift card: ${error.message}`,
          error.stack,
          context,
        );
        throw new GiftCardException(
          GiftCardValidation.ERROR_WHEN_GEN_GIFT_CARD,
        );
      },
    );
  }

  async bulkGen(payload: GenGiftCardDto) {
    const context = `${GiftCardService.name}.${this.bulkGen.name}`;
    this.logger.log(
      `Bulk gen gift card req: ${JSON.stringify(payload)}`,
      context,
    );

    const card = await this.cardRepository.findOne({
      where: {
        slug: payload.cardSlug,
      },
    });

    if (!card) throw new CardException(CardValidation.CARD_NOT_FOUND);

    if (!card.isActive)
      throw new CardException(CardValidation.CARD_IS_NOT_ACTIVE);

    const co = await this.coRepository.findOne({
      where: {
        slug: payload.cardOrderSlug,
      },
    });
    if (!co)
      throw new CardOrderException(CardOrderValidation.CARD_ORDER_NOT_FOUND);

    const gcs = [...Array(payload.quantity)].map(() =>
      this.buildGiftCard(co, card),
    );

    return await this.transactionService.execute<GiftCard[]>(
      async (manager) => {
        return await manager.save(gcs);
      },
      (result) =>
        this.logger.log(
          `Gen gift cards success: ${result.map((item) => item?.slug).join(', ')}`,
          context,
        ),
      (error) => {
        this.logger.error(
          `Error when gen gift cards: ${error.message}`,
          error.stack,
          context,
        );
        throw new GiftCardException(
          GiftCardValidation.ERROR_WHEN_GEN_GIFT_CARD,
        );
      },
    );
  }

  private buildGiftCard(co: CardOrder, card: Card) {
    const gc = new GiftCard();

    // TODO: Hash gc code before saving

    Object.assign(gc, {
      cardName: card.title,
      cardPoints: card.points,
      serial: GiftCardUtil.generateSerial(),
      code: GiftCardUtil.generateRechargeCode(),
      expiredAt: GiftCardUtil.calcExpirationDate(this.EXPIRES_DATE),
      cardOrderId: co.id,
      cardOrderSlug: co.slug,
      cardOrder: co,
    } as Partial<GiftCard>);
    return gc;
  }
}
