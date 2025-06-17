import { Module } from '@nestjs/common';
import { CardService } from './card/card.service';
import { CardController } from './card/card.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Card } from './card/entities/card.entity';
import { CardProfile } from './card/card.mapper';
import { FileModule } from 'src/file/file.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [TypeOrmModule.forFeature([Card]), FileModule, DbModule],
  controllers: [CardController],
  providers: [CardService, CardProfile],
  exports: [CardService],
})
export class GiftCardModule {}
