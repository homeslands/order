import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateVoucherDto, VoucherResponseDto } from './voucher.dto';
import { UpdateVoucherDto } from './voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { VoucherException } from './voucher.exception';
import { VoucherValidation } from './voucher.validation';
import _ from 'lodash';

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
  ) {}

  async create(createVoucherDto: CreateVoucherDto) {
    const context = `${VoucherService.name}.${this.create.name}`;
    const voucher = this.mapper.map(
      createVoucherDto,
      CreateVoucherDto,
      Voucher,
    );
    const createdVoucher = await this.transactionService.execute<Voucher>(
      async (manager) => {
        return await manager.save(voucher);
      },
      (result) => {
        this.logger.log(`Voucher created successfully: ${result}`, context);
      },
      (error) => {
        this.logger.error(
          `Failed to create voucher: ${error.message}`,
          error.stack,
          context,
        );
        throw new VoucherException(VoucherValidation.CREATE_VOUCHER_FAILED);
      },
    );
    return this.mapper.map(createdVoucher, Voucher, VoucherResponseDto);
  }

  async findAll() {
    const context = `${VoucherService.name}.${this.findAll.name}`;
    try {
      const vouchers = await this.voucherRepository.find();
      return this.mapper.mapArray(vouchers, Voucher, VoucherResponseDto);
    } catch (error) {
      this.logger.error(error.message, error.stack, context);
      throw new VoucherException(
        VoucherValidation.FIND_ALL_VOUCHER_FAILED,
        error.message,
      );
    }
  }

  async findOne(slug: string) {
    const context = `${VoucherService.name}.${this.findOne.name}`;
    try {
      const voucher = await this.voucherRepository.findOne({
        where: { slug },
      });
      return this.mapper.map(voucher, Voucher, VoucherResponseDto);
    } catch (error) {
      this.logger.error(error.message, error.stack, context);
      throw new VoucherException(
        VoucherValidation.FIND_ONE_VOUCHER_FAILED,
        error.message,
      );
    }
  }

  async update(slug: string, updateVoucherDto: UpdateVoucherDto) {
    const context = `${VoucherService.name}.${this.update.name}`;
    const voucher = await this.voucherRepository.findOne({
      where: { slug },
    });
    if (!voucher) {
      throw new VoucherException(VoucherValidation.VOUCHER_NOT_FOUND);
    }
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
    const voucher = await this.voucherRepository.findOne({
      where: { slug },
    });
    if (!voucher) {
      throw new VoucherException(VoucherValidation.VOUCHER_NOT_FOUND);
    }
    const deletedVoucher = await this.transactionService.execute<Voucher>(
      async (manager) => {
        return await manager.remove(voucher);
      },
      (result) => {
        this.logger.log(`Voucher deleted successfully: ${result}`, context);
      },
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
