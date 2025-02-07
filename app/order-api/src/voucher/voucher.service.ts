import {
  Inject,
  Injectable,
  Logger,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateVoucherDto,
  GetAllVoucherDto,
  GetVoucherDto,
  VoucherResponseDto,
} from './voucher.dto';
import { UpdateVoucherDto } from './voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { VoucherException } from './voucher.exception';
import { VoucherValidation } from './voucher.validation';
import _ from 'lodash';
import { VoucherUtils } from './voucher.utils';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionService: TransactionManagerService,
    private readonly voucherUtils: VoucherUtils,
  ) {}

  async create(createVoucherDto: CreateVoucherDto) {
    const context = `${VoucherService.name}.${this.create.name}`;
    const voucher = this.mapper.map(
      createVoucherDto,
      CreateVoucherDto,
      Voucher,
    );
    const createdVoucher = await this.transactionService.execute<Voucher>(
      async (manager) => await manager.save(voucher),
      (result) => {
        this.logger.log(`Voucher created successfully: ${result}`, context);
      },
      (error) => {
        this.logger.error(
          `Failed to create voucher: ${error.message}`,
          error.stack,
          context,
        );
        throw new VoucherException(
          VoucherValidation.CREATE_VOUCHER_FAILED,
          error.message,
        );
      },
    );
    return this.mapper.map(createdVoucher, Voucher, VoucherResponseDto);
  }

  async findAll(options: GetAllVoucherDto) {
    const context = `${VoucherService.name}.${this.findAll.name}`;
    const findOptionsWhere: FindOptionsWhere<Voucher> = {};
    if (!_.isNil(options.minOrderValue))
      findOptionsWhere.minOrderValue = MoreThanOrEqual(options.minOrderValue);

    if (!_.isNil(options.date)) {
      findOptionsWhere.startDate = LessThanOrEqual(options.date);
      findOptionsWhere.endDate = MoreThanOrEqual(options.date);
    }

    try {
      const vouchers = await this.voucherRepository.find({
        where: findOptionsWhere,
      });
      return this.mapper.mapArray(vouchers, Voucher, VoucherResponseDto);
    } catch (error) {
      this.logger.error(error.message, error.stack, context);
      throw new VoucherException(
        VoucherValidation.FIND_ALL_VOUCHER_FAILED,
        error.message,
      );
    }
  }

  async findOne(option: GetVoucherDto) {
    if (_.isEmpty(option))
      throw new VoucherException(VoucherValidation.FIND_ONE_VOUCHER_FAILED);

    const findOptionsWhere: FindOptionsWhere<Voucher> = {};
    if (!_.isNil(option.slug)) findOptionsWhere.slug = option.slug;
    if (!_.isNil(option.code)) findOptionsWhere.code = option.code;

    const voucher = await this.voucherUtils.getVoucher({
      where: findOptionsWhere,
    });
    return this.mapper.map(voucher, Voucher, VoucherResponseDto);
  }

  async update(slug: string, updateVoucherDto: UpdateVoucherDto) {
    const context = `${VoucherService.name}.${this.update.name}`;
    const voucher = await this.voucherUtils.getVoucher({ where: { slug } });
    Object.assign(voucher, updateVoucherDto);

    const updatedVoucher = await this.transactionService.execute<Voucher>(
      async (manager) => {
        return await manager.save(voucher);
      },
      (result) => {
        this.logger.log(`Voucher updated successfully: ${result}`, context);
      },
      (error) => {
        this.logger.error(
          `Failed to updated voucher: ${error.message}`,
          error.stack,
          context,
        );
        throw new VoucherException(
          VoucherValidation.UPDATE_VOUCHER_FAILED,
          error.message,
        );
      },
    );
    return this.mapper.map(updatedVoucher, Voucher, VoucherResponseDto);
  }

  async remove(slug: string) {
    const context = `${VoucherService.name}.${this.remove.name}`;
    const voucher = await this.voucherUtils.getVoucher({
      where: { slug },
    });
    const deletedVoucher = await this.transactionService.execute<Voucher>(
      async (manager) => await manager.remove(voucher),
      (result) =>
        this.logger.log(`Voucher deleted successfully: ${result}`, context),
      (error) => {
        this.logger.error(
          `Failed to delete voucher: ${error.message}`,
          error.stack,
          context,
        );
        throw new VoucherException(
          VoucherValidation.DELETE_VOUCHER_FAILED,
          error.message,
        );
      },
    );
    return this.mapper.map(deletedVoucher, Voucher, VoucherResponseDto);
  }
}
