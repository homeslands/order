import { Module } from '@nestjs/common';
import { GoogleMapService } from './google-map.service';
import { GoogleMapController } from './google-map.controller';
import { GoogleMapConnectorClient } from './google-map-connector.client';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { GoogleMapProfile } from './google-map.mapper';
import { Branch } from 'src/branch/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, Branch]), HttpModule],
  controllers: [GoogleMapController],
  providers: [GoogleMapService, GoogleMapConnectorClient, GoogleMapProfile],
  exports: [GoogleMapService],
})
export class GoogleMapModule {}
