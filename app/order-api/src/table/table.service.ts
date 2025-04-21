import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BulkCreateTablesRequestDto,
  CreateTableRequestDto,
  TableResponseDto,
  UpdateTableRequestDto,
  UpdateTableStatusRequestDto,
} from './table.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Table } from './table.entity';
import { IsNull, Repository } from 'typeorm';
import { Branch } from 'src/branch/branch.entity';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RobotConnectorClient } from 'src/robot-connector/robot-connector.client';
import { BranchException } from 'src/branch/branch.exception';
import { BranchValidation } from 'src/branch/branch.validation';
import { TableException } from './table.exception';
import { TableValidation } from './table.validation';
import { BranchUtils } from 'src/branch/branch.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { TableUtils } from './table.utils';
import { TableStatus } from './table.constant';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly robotConnectorClient: RobotConnectorClient,
    private readonly branchUtils: BranchUtils,
    private readonly tableUtils: TableUtils,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  async getLocations() {
    const locations = await this.robotConnectorClient.retrieveAllQRLocations();
    return locations.filter((location) => {
      const isAssigned = location.metadata?.isAssigned;
      return isAssigned === undefined || isAssigned === false;
    });
  }

  async bulkCreateTables(
    bulkCreateTablesRequestDto: BulkCreateTablesRequestDto,
  ): Promise<TableResponseDto[]> {
    const context = `${TableService.name}.${this.bulkCreateTables.name}`;
    const branch = await this.branchUtils.getBranch({
      where: {
        slug: bulkCreateTablesRequestDto.branch || IsNull(),
      },
    });
    if (bulkCreateTablesRequestDto.from > bulkCreateTablesRequestDto.to) {
      this.logger.warn(
        TableValidation.FROM_NUMBER_MUST_LESS_OR_EQUAL_TO_NUMBER.message,
        context,
      );
      throw new TableException(
        TableValidation.FROM_NUMBER_MUST_LESS_OR_EQUAL_TO_NUMBER,
      );
    }

    const tables: Table[] = [];
    for (
      let i = bulkCreateTablesRequestDto.from;
      i <= bulkCreateTablesRequestDto.to;
      i += bulkCreateTablesRequestDto.step
    ) {
      await this.validateNameTable(`${i}`, branch.slug);
      const table = new Table();
      table.name = `${i}`;
      table.branch = branch;
      table.status = TableStatus.AVAILABLE;
      tables.push(table);
    }

    const createdTables = await this.transactionManagerService.execute<Table[]>(
      async (manager) => {
        return await manager.save(tables);
      },
      (result) => {
        this.logger.log(`${result.length} created successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Error creating table: ${error.message}`,
          error.stack,
          context,
        );
        throw new TableException(TableValidation.CREATE_TABLE_FAILED);
      },
    );
    return this.mapper.mapArray(createdTables, Table, TableResponseDto);
  }

  async validateNameTable(name: string, branch: string) {
    const context = `${TableService.name}.${this.validateNameTable.name}`;
    const table = await this.tableRepository.findOne({
      where: { name, branch: { slug: branch } },
    });
    if (table) {
      this.logger.warn(TableValidation.TABLE_NAME_EXIST.message, context);
      throw new TableException(TableValidation.TABLE_NAME_EXIST);
    }
  }

  /**
   * Create a new table
   * @param {CreateTableRequestDto} createTableDto The data to create a new table
   * @returns {Promise<TableResponseDto>} The created table
   * @throws {BranchException} If the table name already exists in this branch
   */
  async create(
    createTableDto: CreateTableRequestDto,
  ): Promise<TableResponseDto> {
    const context = `${TableService.name}.${this.create.name}`;
    const branch = await this.branchUtils.getBranch({
      where: {
        slug: createTableDto.branch || IsNull(),
      },
    });

    // Validate location if location is provided
    if (createTableDto.location)
      await this.validateTableLocation(createTableDto.location);

    const table = this.mapper.map(createTableDto, CreateTableRequestDto, Table);

    Object.assign(table, { branch });

    const createdTable = await this.transactionManagerService.execute<Table>(
      async (manager) => {
        return await manager.save(table);
      },
      (result) => {
        this.logger.log(`Table ${result.name} created successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Error creating table: ${error.message}`,
          error.stack,
          context,
        );
        throw new TableException(TableValidation.CREATE_TABLE_FAILED);
      },
    );

    return this.mapper.map(createdTable, Table, TableResponseDto);
  }

  /**
   * Retrieve all tables by branch
   * @param {string} branch The slug of branch
   * @returns {Promise<TableResponseDto[]>} The array of retrieved tables
   */
  async findAll(branch: string): Promise<TableResponseDto[]> {
    const context = `${TableService.name}.${this.findAll.name}`;
    const branchData = await this.branchRepository.findOneBy({ slug: branch });
    if (!branchData) {
      this.logger.warn(`Branch ${branch} not found`, context);
      throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    }

    const tables = await this.tableRepository.find({
      where: {
        branch: {
          slug: branch,
        },
      },
    });

    tables.sort((a, b) => {
      const aNum = parseInt(a.name, 10);
      const bNum = parseInt(b.name, 10);

      const aIsNumber = !isNaN(aNum);
      const bIsNumber = !isNaN(bNum);

      if (aIsNumber && bIsNumber) {
        return aNum - bNum;
      } else if (aIsNumber) {
        return -1; // a is number, b is string => a up first
      } else if (bIsNumber) {
        return 1; // b is number, a is string => b up first
      } else {
        return a.name.localeCompare(b.name); // both are string => sort by string
      }
    });
    const tablesDto = this.mapper.mapArray(tables, Table, TableResponseDto);
    return tablesDto;
  }

  /**
   * Change status table by slug
   * @param {string} slug The slug of table needs changing status
   * @returns {Promise<TableResponseDto>} The table data after change status
   * @throws {TableException} If table is not found
   */
  async changeStatus(
    slug: string,
    requestData: UpdateTableStatusRequestDto,
  ): Promise<TableResponseDto> {
    const context = `${TableService.name}.${this.changeStatus.name}`;
    const table = await this.tableRepository.findOneBy({ slug });
    if (!table) {
      this.logger.warn(`Table ${slug} not found`, context);
      throw new TableException(TableValidation.TABLE_NOT_FOUND);
    }

    Object.assign(table, { ...requestData });
    const updatedTable = await this.tableRepository.save(table);
    this.logger.log(`Table ${slug} changed status successfully`, context);
    const tableDto = this.mapper.map(updatedTable, Table, TableResponseDto);
    return tableDto;
  }

  /**
   * Update table data by slug
   * @param {string} slug The slug of table needs updating
   * @param {UpdateTableRequestDto} updateTableDto The data to update table
   * @returns {Promise<TableResponseDto>} The updated table
   * @throws {TableException} If table is not found
   * @throws {BranchException} If the updated name of table that already exists at this branch
   */
  async update(
    slug: string,
    updateTableDto: UpdateTableRequestDto,
  ): Promise<TableResponseDto> {
    const context = `${TableService.name}.${this.update.name}`;
    const table = await this.tableUtils.getTable({
      where: {
        slug,
      },
      relations: ['branch'],
    });

    const requestData = this.mapper.map(
      updateTableDto,
      UpdateTableRequestDto,
      Table,
    );

    // Validate location if new location is different from old location
    if (requestData.location)
      if (requestData.location !== table.location) {
        // Validate location if location is provided
        await this.validateTableLocation(requestData.location);
      }

    // update table
    Object.assign(table, {
      ...requestData,
    });

    const updatedTable = await this.transactionManagerService.execute<Table>(
      async (manager) => {
        const updatedTable = await manager.save(table);
        return updatedTable;
      },
      (result) => {
        this.logger.log(`Table ${result.name} updated successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Error updating table: ${error.message}`,
          error.stack,
          context,
        );
        throw new TableException(TableValidation.UPDATE_TABLE_FAILED);
      },
    );

    return this.mapper.map(updatedTable, Table, TableResponseDto);
  }

  /**
   * Delete table by slug
   * @param {string} slug The slug of table
   * @returns {Promise<number>} The number of deleted records
   */
  async remove(slug: string): Promise<number> {
    const context = `${TableService.name}.${this.remove.name}`;
    const table = await this.tableUtils.getTable({ where: { slug } });

    const deleted = await this.transactionManagerService.execute<Table>(
      async (manager) => {
        return await manager.remove(Table, table);
      },
      () => {
        this.logger.log(`Table ${slug} deleted successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Error deleting table: ${error.message}`,
          error.stack,
          context,
        );
        throw new TableException(TableValidation.DELETE_TABLE_FAILED);
      },
    );
    const effected = 1;
    return deleted ? effected : 0;
  }

  private async validateTableLocation(locationId: string) {
    const context = `${TableService.name}.${this.validateTableLocation.name}`;
    const location =
      await this.robotConnectorClient.getQRLocationById(locationId);
    if (!location) {
      this.logger.warn(`Location ${locationId} not found`, context);
      throw new TableException(TableValidation.LOCATION_NOT_FOUND);
    }

    if (location.metadata?.isAssigned) {
      this.logger.warn(`Location ${locationId} is already assigned`, context);
      throw new TableException(TableValidation.LOCATION_ASSIGNED);
    }
  }
}
