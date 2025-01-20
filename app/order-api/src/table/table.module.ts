import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { TableProfile } from './table.mapper';
import { Table } from './table.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from 'src/branch/branch.entity';
import { RobotConnectorModule } from 'src/robot-connector/robot-connector.module';
import { TableSubscriber } from './table.subscriber';
import { TableUtils } from './table.utils';

@Module({
  imports: [TypeOrmModule.forFeature([Table, Branch]), RobotConnectorModule],
  controllers: [TableController],
  providers: [TableService, TableProfile, TableSubscriber, TableUtils],
  exports: [TableService, TableUtils],
})
export class TableModule {}
