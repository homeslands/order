import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { Table } from './table.entity';
import { TableStatus } from './table.constant';
import * as _ from 'lodash';
import { TableValidation } from './table.validation';

@Injectable()
export class TableScheduler {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async clearReservedTable() {
    const context = `${TableScheduler.name}.${this.clearReservedTable.name}`;
    const tables = await this.tableRepository.find({
      where: { status: TableStatus.RESERVED },
    });
    this.logger.log(`Table count = ${tables.length}`, context);

    tables.forEach(async (table) => {
      Object.assign(table, { status: TableStatus.AVAILABLE });
    });
    this.tableRepository.manager.transaction(async (manager) => {
      try {
        if (_.size(tables) > 0) {
          await manager.save(tables);
        }
        this.logger.log(`Clear reserved table success`, context);
      } catch (error) {
        this.logger.error(
          TableValidation.ERROR_WHEN_UPDATE_STATUS_TABLE_IN_SCHEDULER.message,
          error.stack,
          context,
        );
      }
    });
  }
}
