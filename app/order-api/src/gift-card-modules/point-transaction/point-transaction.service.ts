import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PointTransaction } from './entities/point-transaction.entity';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { PointTransactionResponseDto } from './dto/point-transaction-response.dto';
import { createSortOptions } from 'src/shared/utils/obj.util';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { PointTransactionException } from './point-transaction.exception';
import { PointTransactionValidation } from './point-transaction.validation';
import { FindAllPointTransactionDto } from './dto/find-all-point-transaction.dto';
import { CreatePointTransactionDto } from './dto/create-point-transaction.dto';

@Injectable()
export class PointTransactionService {
  /**
   *
   */
  constructor(
    @InjectRepository(PointTransaction)
    private ptRepository: Repository<PointTransaction>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionService: TransactionManagerService,
  ) {}

  async create(req: CreatePointTransactionDto) {
    const context = `${PointTransaction.name}.${this.create.name}`;
    this.logger.log(
      `Create point transaction req; ${JSON.stringify(req)}`,
      context,
    );

    const payload = this.mapper.map(
      req,
      CreatePointTransactionDto,
      PointTransaction,
    );

    // TODO: handle logic

    const pt = await this.transactionService.execute<PointTransaction>(
      async (manager) => {
        return manager.save(payload);
      },
      (res) =>
        this.logger.log(
          `Point transaction created: ${JSON.stringify(res)}`,
          context,
        ),
      (err) => {
        this.logger.error(
          `Error when creating point transaction: ${err.message}`,
          err.stack,
          context,
        );
        throw new PointTransactionException(
          PointTransactionValidation.ERROR_WHEN_CREATE_POINT_TRANSACTION,
        );
      },
    );
    return this.mapper.map(pt, PointTransaction, PointTransactionResponseDto);
  }

  async findAll(req: FindAllPointTransactionDto) {
    const context = `${PointTransactionService.name}.${this.findAll.name}`;
    this.logger.log(
      `Find all point transaction: ${JSON.stringify(req)}`,
      context,
    );

    const { page, size, sort, userSlug } = req;

    const whereOpts: FindOptionsWhere<PointTransaction> = {};
    if (userSlug) {
      whereOpts.user = {
        slug: userSlug,
      };
    }
    const sortOpts = createSortOptions<PointTransaction>(sort);

    const [pts, total] = await this.ptRepository.findAndCount({
      where: whereOpts,
      order: sortOpts,
      take: size,
      skip: (page - 1) * size,
    });
    const cardsResponse = this.mapper.mapArray(
      pts,
      PointTransaction,
      PointTransactionResponseDto,
    );
    // Calculate total pages
    const totalPages = Math.ceil(total / size);
    // Determine hasNext and hasPrevious
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: cardsResponse,
      total,
      page: page,
      pageSize: size,
      totalPages,
    } as AppPaginatedResponseDto<PointTransactionResponseDto>;
  }

  async findOne(slug: string) {
    const context = `${PointTransactionService.name}.${this.findOne.name}`;
    this.logger.log(`Find point transaction: ${JSON.stringify(slug)}`, context);

    const pt = await this.ptRepository.findOne({
      where: {
        slug: slug ?? IsNull(),
      },
    });
    if (!pt)
      throw new PointTransactionException(
        PointTransactionValidation.POINT_TRANSACTION_NOT_FOUND,
      );
    return this.mapper.map(pt, PointTransaction, PointTransactionResponseDto);
  }
}
