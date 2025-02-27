import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Table } from './table.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { TableException } from './table.exception';
import { TableValidation } from './table.validation';

@Injectable()
export class TableUtils {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async getTable(options: FindOneOptions<Table>): Promise<Table> {
    const table = await this.tableRepository.findOne({ ...options });
    if (!table) throw new TableException(TableValidation.TABLE_NOT_FOUND);
    return table;
  }
}
