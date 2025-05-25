import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BulkCreateVoucherDto,
  CreateVoucherDto,
  GetAllVoucherDto,
  GetAllVoucherForUserDto,
  GetAllVoucherForUserPublicDto,
  GetVoucherDto,
  ValidateVoucherDto,
  ValidateVoucherPublicDto,
  VoucherResponseDto,
} from './voucher.dto';
import { UpdateVoucherDto } from './voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import {
  FindManyOptions,
  FindOptionsWhere,
  IsNull,
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
import { OrderUtils } from 'src/order/order.utils';
import { getRandomString } from 'src/helper';
import { VoucherType, VoucherValueType } from './voucher.constant';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { VoucherGroupUtils } from 'src/voucher-group/voucher-group.utils';

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
    private readonly orderUtils: OrderUtils,
    private readonly voucherGroupUtils: VoucherGroupUtils,
  ) {}

  async validateVoucher(validateVoucherDto: ValidateVoucherDto) {
    const voucher = await this.voucherUtils.getVoucher({
      where: { slug: validateVoucherDto.voucher ?? IsNull() },
    });

    await this.voucherUtils.validateVoucher(voucher);
    await this.voucherUtils.validateVoucherUsage(
      voucher,
      validateVoucherDto.user,
    );
  }

  async validateVoucherPublic(
    validateVoucherPublicDto: ValidateVoucherPublicDto,
  ) {
    const voucher = await this.voucherUtils.getVoucher({
      where: { slug: validateVoucherPublicDto.voucher ?? IsNull() },
    });

    await this.voucherUtils.validateVoucher(voucher);
    await this.voucherUtils.validateVoucherUsage(voucher);
  }

  async create(createVoucherDto: CreateVoucherDto) {
    const context = `${VoucherService.name}.${this.create.name}`;
    this.logger.log(
      `Create voucher: ${JSON.stringify(createVoucherDto)}`,
      context,
    );
    const voucherGroup = await this.voucherGroupUtils.getVoucherGroup({
      where: { slug: createVoucherDto.voucherGroup },
    });
    const voucher = this.mapper.map(
      createVoucherDto,
      CreateVoucherDto,
      Voucher,
    );
    voucher.remainingUsage = voucher.maxUsage;
    voucher.voucherGroup = voucherGroup;
    if (voucher.type === VoucherType.PERCENT_ORDER) {
      voucher.valueType = VoucherValueType.PERCENTAGE;
    } else if (voucher.type === VoucherType.FIXED_VALUE) {
      voucher.valueType = VoucherValueType.AMOUNT;
    } else {
      throw new VoucherException(VoucherValidation.INVALID_VOUCHER_TYPE);
    }

    if (voucher.isVerificationIdentity) {
      // include case maxUsage > numberOfUsagePerUser
      // maxUsage >= 1
      // numberOfUsagePerUser >= 1
      if (voucher.maxUsage % voucher.numberOfUsagePerUser !== 0) {
        this.logger.warn(
          VoucherValidation.INVALID_NUMBER_OF_USAGE_PER_USER.message,
          context,
        );
        throw new VoucherException(
          VoucherValidation.INVALID_NUMBER_OF_USAGE_PER_USER,
        );
      }
    }

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

  async bulkCreate(bulkCreateVoucherDto: BulkCreateVoucherDto) {
    const context = `${VoucherService.name}.${this.bulkCreate.name}`;

    const existingVoucher = await this.voucherRepository.findOne({
      where: { title: bulkCreateVoucherDto.title },
    });
    if (existingVoucher) {
      this.logger.warn(
        `${VoucherValidation.DUPLICATE_VOUCHER_TITLE.message}: ${bulkCreateVoucherDto.title}`,
        context,
      );
      throw new VoucherException(VoucherValidation.DUPLICATE_VOUCHER_TITLE);
    }

    const voucherGroup = await this.voucherGroupUtils.getVoucherGroup({
      where: { slug: bulkCreateVoucherDto.voucherGroup },
    });
    const numberOfVoucher = bulkCreateVoucherDto.numberOfVoucher;

    const voucherTemplate = this.mapper.map(
      bulkCreateVoucherDto,
      BulkCreateVoucherDto,
      Voucher,
    );
    voucherTemplate.remainingUsage = voucherTemplate.maxUsage;
    voucherTemplate.voucherGroup = voucherGroup;

    if (voucherTemplate.type === VoucherType.PERCENT_ORDER) {
      voucherTemplate.valueType = VoucherValueType.PERCENTAGE;
    } else if (voucherTemplate.type === VoucherType.FIXED_VALUE) {
      voucherTemplate.valueType = VoucherValueType.AMOUNT;
    } else {
      throw new VoucherException(VoucherValidation.INVALID_VOUCHER_TYPE);
    }

    if (voucherTemplate.isVerificationIdentity) {
      // include case maxUsage > numberOfUsagePerUser
      // maxUsage >= 1
      // numberOfUsagePerUser >= 1
      if (
        voucherTemplate.maxUsage % voucherTemplate.numberOfUsagePerUser !==
        0
      ) {
        this.logger.warn(
          VoucherValidation.INVALID_NUMBER_OF_USAGE_PER_USER.message,
          context,
        );
        throw new VoucherException(
          VoucherValidation.INVALID_NUMBER_OF_USAGE_PER_USER,
        );
      }
    }

    const vouchers = [];
    for (let i = 0; i < numberOfVoucher; i++) {
      const voucher = _.cloneDeep(voucherTemplate);
      voucher.code = `${getRandomString()}${i}`;
      vouchers.push(voucher);
    }

    const createdVouchers = await this.transactionService.execute<Voucher[]>(
      async (manager) => await manager.save(vouchers),
      (result) => {
        this.logger.log(
          `${result.length} vouchers created successfully`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Failed to create vouchers: ${error.message}`,
          error.stack,
          context,
        );
        throw new VoucherException(
          VoucherValidation.CREATE_VOUCHER_FAILED,
          error.message,
        );
      },
    );
    return this.mapper.mapArray(createdVouchers, Voucher, VoucherResponseDto);
  }
  async findAllForUser(
    options: GetAllVoucherForUserDto,
  ): Promise<AppPaginatedResponseDto<VoucherResponseDto>> {
    const context = `${VoucherService.name}.${this.findAllForUser.name}`;

    const findOptionsWhere: FindOptionsWhere<Voucher> = {};
    findOptionsWhere.isPrivate = false;

    if (!_.isNil(options.minOrderValue))
      findOptionsWhere.minOrderValue = MoreThanOrEqual(options.minOrderValue);

    if (!_.isNil(options.date)) {
      findOptionsWhere.startDate = LessThanOrEqual(options.date);
      findOptionsWhere.endDate = MoreThanOrEqual(options.date);
    }

    if (!_.isNil(options.isActive))
      findOptionsWhere.isActive = options.isActive;

    if (!_.isNil(options.isVerificationIdentity))
      findOptionsWhere.isVerificationIdentity = options.isVerificationIdentity;

    try {
      const findManyOptions: FindManyOptions<Voucher> = {
        where: findOptionsWhere,
        order: {
          createdAt: 'DESC',
        },
      };
      if (options.hasPaging) {
        Object.assign(findManyOptions, {
          skip: (options.page - 1) * options.size,
          take: options.size,
        });
      }
      const [vouchers, total] =
        await this.voucherRepository.findAndCount(findManyOptions);
      const totalPages = Math.ceil(total / options.size);
      const hasNext = options.page < totalPages;
      const hasPrevious = options.page > 1;
      const vouchersDto = this.mapper.mapArray(
        vouchers,
        Voucher,
        VoucherResponseDto,
      );
      return {
        hasNext,
        hasPrevios: hasPrevious,
        items: vouchersDto,
        total,
        page: options.hasPaging ? options.page : 1,
        pageSize: options.hasPaging ? options.size : total,
        totalPages,
      } as AppPaginatedResponseDto<VoucherResponseDto>;
    } catch (error) {
      this.logger.error(error.message, error.stack, context);
      throw new VoucherException(
        VoucherValidation.FIND_ALL_VOUCHER_FAILED,
        error.message,
      );
    }
  }

  async findAllForUserPublic(
    options: GetAllVoucherForUserPublicDto,
  ): Promise<AppPaginatedResponseDto<VoucherResponseDto>> {
    const context = `${VoucherService.name}.${this.findAllForUserPublic.name}`;

    const findOptionsWhere: FindOptionsWhere<Voucher> = {};
    findOptionsWhere.isPrivate = false;
    findOptionsWhere.isVerificationIdentity = false;

    if (!_.isNil(options.minOrderValue))
      findOptionsWhere.minOrderValue = MoreThanOrEqual(options.minOrderValue);

    if (!_.isNil(options.date)) {
      findOptionsWhere.startDate = LessThanOrEqual(options.date);
      findOptionsWhere.endDate = MoreThanOrEqual(options.date);
    }

    if (!_.isNil(options.isActive))
      findOptionsWhere.isActive = options.isActive;

    try {
      const findManyOptions: FindManyOptions<Voucher> = {
        where: findOptionsWhere,
        order: {
          createdAt: 'DESC',
        },
      };
      if (options.hasPaging) {
        Object.assign(findManyOptions, {
          skip: (options.page - 1) * options.size,
          take: options.size,
        });
      }
      const [vouchers, total] =
        await this.voucherRepository.findAndCount(findManyOptions);
      const totalPages = Math.ceil(total / options.size);
      const hasNext = options.page < totalPages;
      const hasPrevious = options.page > 1;
      const vouchersDto = this.mapper.mapArray(
        vouchers,
        Voucher,
        VoucherResponseDto,
      );
      return {
        hasNext,
        hasPrevios: hasPrevious,
        items: vouchersDto,
        total,
        page: options.hasPaging ? options.page : 1,
        pageSize: options.hasPaging ? options.size : total,
        totalPages,
      } as AppPaginatedResponseDto<VoucherResponseDto>;
    } catch (error) {
      this.logger.error(error.message, error.stack, context);
      throw new VoucherException(
        VoucherValidation.FIND_ALL_VOUCHER_FAILED,
        error.message,
      );
    }
  }

  async findAll(
    options: GetAllVoucherDto,
  ): Promise<AppPaginatedResponseDto<VoucherResponseDto>> {
    const context = `${VoucherService.name}.${this.findAll.name}`;

    const voucherGroup = await this.voucherGroupUtils.getVoucherGroup({
      where: { slug: options.voucherGroup },
    });

    const findOptionsWhere: FindOptionsWhere<Voucher> = {
      voucherGroup: { slug: voucherGroup.slug },
    };

    if (!_.isNil(options.minOrderValue))
      findOptionsWhere.minOrderValue = MoreThanOrEqual(options.minOrderValue);

    if (!_.isNil(options.date)) {
      findOptionsWhere.startDate = LessThanOrEqual(options.date);
      findOptionsWhere.endDate = MoreThanOrEqual(options.date);
    }

    if (!_.isNil(options.isActive))
      findOptionsWhere.isActive = options.isActive;

    if (!_.isNil(options.isPrivate))
      findOptionsWhere.isPrivate = options.isPrivate;

    try {
      const findManyOptions: FindManyOptions<Voucher> = {
        where: findOptionsWhere,
        order: {
          createdAt: 'DESC',
        },
      };
      if (options.hasPaging) {
        Object.assign(findManyOptions, {
          skip: (options.page - 1) * options.size,
          take: options.size,
        });
      }
      const [vouchers, total] =
        await this.voucherRepository.findAndCount(findManyOptions);
      const totalPages = Math.ceil(total / options.size);
      const hasNext = options.page < totalPages;
      const hasPrevious = options.page > 1;
      const vouchersDto = this.mapper.mapArray(
        vouchers,
        Voucher,
        VoucherResponseDto,
      );
      return {
        hasNext,
        hasPrevios: hasPrevious,
        items: vouchersDto,
        total,
        page: options.hasPaging ? options.page : 1,
        pageSize: options.hasPaging ? options.size : total,
        totalPages,
      } as AppPaginatedResponseDto<VoucherResponseDto>;
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

    const findOptionsWhere: FindOptionsWhere<Voucher> = {
      slug: option.slug,
      code: option.code,
    };

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
        this.logger.log(
          `Voucher updated successfully: ${result.code}`,
          context,
        );
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
