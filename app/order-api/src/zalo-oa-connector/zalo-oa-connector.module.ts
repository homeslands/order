import { Module } from '@nestjs/common';
import { ZaloOaConnectorService } from './zalo-oa-connector.service';
import { ZaloOaConnectorController } from './zalo-oa-connector.controller';
import { ZaloOaConnectorConfig } from './entity/zalo-oa-connector.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZaloOaConnectorProfile } from './zalo-oa-connector.mapper';
import { ZaloOaConnectorClient } from './zalo-oa-connector.client';
import { HttpModule } from '@nestjs/axios';
import { ZaloOaConnectorHistory } from './entity/zalo-oa-connector-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ZaloOaConnectorConfig, ZaloOaConnectorHistory]),
    HttpModule,
  ],
  controllers: [ZaloOaConnectorController],
  providers: [
    ZaloOaConnectorService,
    ZaloOaConnectorProfile,
    ZaloOaConnectorClient,
  ],
  exports: [ZaloOaConnectorService, ZaloOaConnectorClient],
})
export class ZaloOaConnectorModule {}
