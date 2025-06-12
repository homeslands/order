import { Module } from '@nestjs/common';
import { CardService } from './card/card.service';
import { CardController } from './card/card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './card/entities/card.entity';
import { CardProfile } from './card/card.mapper';
import { FileModule } from 'src/file/file.module';
import { DbModule } from 'src/db/db.module';
import { BalanceController } from './balance/balance.controller';
import { BalanceService } from './balance/balance.service';
import { CardOrderController } from './card-order/card-order.controller';
import { GiftCardController } from './gift-card/gift-card.controller';
import { CardOrderService } from './card-order/card-order.service';
import { GiftCardService } from './gift-card/gift-card.service';
import { ReceipientController } from './receipient/recipient.controller';
import { Balance } from './balance/entities/balance.entity';
import { GiftCard } from './gift-card/entities/gift-card.entity';
import { CardOrder } from './card-order/entities/card-order.entity';
import { BalanceProfile } from './balance/balance.mapper';
import { User } from 'src/user/user.entity';
import { CardOrderProfile } from './card-order/card-order.mapper';
import { GiftCardProfile } from './gift-card/gift-card.mapper';
import { RecipientService } from './receipient/recipient.service';
import { RecipientProfile } from './receipient/recipient.mapper';
import { Recipient } from './receipient/entities/receipient.entity';
import { CardOrderSubscriber } from './card-order/card-order.subscriber';
import { BankTransferStrategy } from 'src/payment/strategy/bank-transfer.strategy';
import { ACBConnectorClient } from 'src/acb-connector/acb-connector.client';
import { ACBConnectorConfig } from 'src/acb-connector/acb-connector.entity';
import { Payment } from 'src/payment/payment.entity';
import { HttpModule } from '@nestjs/axios';

const controllers = [
  CardController,
  BalanceController,
  CardOrderController,
  GiftCardController,
  ReceipientController,
];

const providers = [
  CardService,
  BalanceService,
  CardOrderService,
  GiftCardService,
  RecipientService,
  BankTransferStrategy,
  ACBConnectorClient,
];

const mappers = [
  BalanceProfile,
  CardProfile,
  CardOrderProfile,
  RecipientProfile,
  GiftCardProfile,
];

const modules = [
  TypeOrmModule.forFeature([
    Card,
    Balance,
    CardOrder,
    GiftCard,
    Recipient,
    User,
    ACBConnectorConfig,
    Payment,
  ]),
  FileModule,
  DbModule,
  HttpModule,
];

const exportServices = [
  CardService,
  BalanceService,
  CardOrderService,
  GiftCardService,
  RecipientService,
];

const exportMappers = [];

const subscribers = [CardOrderSubscriber];

@Module({
  imports: [...modules],
  controllers: [...controllers],
  providers: [...providers, ...mappers, ...subscribers],
  exports: [...exportServices, ...exportMappers],
})
export class GiftCardModule {}
