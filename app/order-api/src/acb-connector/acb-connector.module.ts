import { Module } from '@nestjs/common';
import { ACBConnectorClient } from './acb-connector.client';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ACBConnectorController } from './acb-connector.controller';
import { ACBConnectorService } from './acb-connector.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ACBConnectorConfig } from './acb-connector.entity';
import { ACBConnectorProfile } from './acb-connector.mapper';
import { DbModule } from 'src/db/db.module';
import { ACBConnectorUtils } from './acb-connector.utils';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    TypeOrmModule.forFeature([ACBConnectorConfig]),
    DbModule,
  ],
  providers: [
    ACBConnectorClient,
    ACBConnectorService,
    ACBConnectorProfile,
    ACBConnectorUtils,
  ],
  exports: [ACBConnectorClient, ACBConnectorUtils],
  controllers: [ACBConnectorController],
})
export class ACBConnectorModule {}
