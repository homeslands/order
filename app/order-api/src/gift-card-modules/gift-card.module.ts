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
import { ReceipientController } from './receipient/receipient.controller';
import { ReceipientService } from './receipient/receipient.service';
import { Balance } from './balance/entities/balance.entity';
import { Receipient } from './receipient/entities/receipient.entity';
import { GiftCard } from './gift-card/entities/gift-card.entity';
import { CardOrder } from './card-order/entities/card-order.entity';
import { BalanceProfile } from './balance/balance.mapper';
import { User } from 'src/user/user.entity';

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
  ReceipientService,
];

const mappers = [BalanceProfile, CardProfile];

const modules = [
  TypeOrmModule.forFeature([
    Card,
    Balance,
    CardOrder,
    GiftCard,
    Receipient,
    User,
  ]),
  FileModule,
  DbModule,
];
const exportComponents = [
  CardService,
  BalanceService,
  CardOrderService,
  GiftCardService,
  ReceipientService,
];

@Module({
  imports: [...modules],
  controllers: [...controllers],
  providers: [...providers, ...mappers],
  exports: [...exportComponents],
})
export class GiftCardModule {}
