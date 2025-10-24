import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  AddVoucherPaymentMethodRequestDto,
  BulkCreateVoucherDto,
  CreateVoucherDto,
  ExportPdfVoucherDto,
  GetAllVoucherDto,
  GetAllVoucherForUserDto,
  GetAllVoucherForUserEligibleDto,
  GetAllVoucherForUserPublicDto,
  GetVoucherDto,
  RemoveVoucherPaymentMethodRequestDto,
  ValidateVoucherDto,
  ValidateVoucherPaymentMethodDto,
  ValidateVoucherPublicDto,
  VoucherPaymentMethodResponseDto,
  VoucherResponseDto,
} from './voucher.dto';
import { UpdateVoucherDto } from './voucher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './entity/voucher.entity';
import {
  Brackets,
  FindManyOptions,
  FindOptionsWhere,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
  SelectQueryBuilder,
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
import {
  VoucherApplicabilityRule,
  VoucherType,
  VoucherValueType,
} from './voucher.constant';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { VoucherGroupUtils } from 'src/voucher-group/voucher-group.utils';
import { PdfService } from 'src/pdf/pdf.service';
import moment from 'moment';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { PDFDocument } from 'pdf-lib';
import { ProductUtils } from 'src/product/product.utils';
import { VoucherProduct } from 'src/voucher-product/voucher-product.entity';
import { VoucherPaymentMethod } from './entity/voucher-payment-method.entity';
import { PaymentMethod } from 'src/payment/payment.constants';
import { UserGroup } from 'src/user-group/user-group.entity';
import { UserGroupException } from 'src/user-group/user-group.exception';
import { UserGroupValidation } from 'src/user-group/user-group.validation';
import { User } from 'src/user/user.entity';
import { Product } from 'src/product/product.entity';
import { RoleEnum } from 'src/role/role.enum';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionService: TransactionManagerService,
    private readonly voucherUtils: VoucherUtils,
    private readonly orderUtils: OrderUtils,
    private readonly voucherGroupUtils: VoucherGroupUtils,
    private readonly pdfService: PdfService,
    private readonly qrCodeService: QrCodeService,
    private readonly productUtils: ProductUtils,
    @InjectRepository(VoucherPaymentMethod)
    private readonly voucherPaymentMethodRepository: Repository<VoucherPaymentMethod>,
  ) {}

  async validateVoucher(validateVoucherDto: ValidateVoucherDto) {
    const voucher = await this.voucherUtils.getVoucher({
      where: { slug: validateVoucherDto.voucher ?? IsNull() },
      relations: {
        voucherUserGroups: { userGroup: true },
        voucherProducts: { product: true },
      },
    });

    // await this.voucherUtils.validateVoucher(voucher);
    await this.voucherUtils.validateVoucherTime(voucher);
    this.voucherUtils.validateVoucherRemainingUsage(voucher);
    await this.voucherUtils.validateVoucherUsage(
      voucher,
      validateVoucherDto.user,
    );
    await this.voucherUtils.validateVoucherProduct(
      voucher,
      validateVoucherDto.orderItems.map((orderItem) => orderItem.variant) || [],
    );
  }

  async validateVoucherPublic(
    validateVoucherPublicDto: ValidateVoucherPublicDto,
  ) {
    const voucher = await this.voucherUtils.getVoucher({
      where: { slug: validateVoucherPublicDto.voucher ?? IsNull() },
      relations: {
        voucherProducts: { product: true },
        voucherUserGroups: { userGroup: true },
      },
    });

    // await this.voucherUtils.validateVoucher(voucher);
    await this.voucherUtils.validateVoucherTime(voucher);
    this.voucherUtils.validateVoucherRemainingUsage(voucher);
    await this.voucherUtils.validateVoucherUsage(voucher);
    await this.voucherUtils.validateVoucherProduct(
      voucher,
      validateVoucherPublicDto.orderItems.map(
        (orderItem) => orderItem.variant,
      ) || [],
    );
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

    this.voucherUtils.validateInitiateVoucherUserGroup(
      createVoucherDto.isVerificationIdentity,
      createVoucherDto.isUserGroup,
    );

    const productSlugs = createVoucherDto.products;
    const paymentMethods = createVoucherDto.paymentMethods;
    const voucher = this.mapper.map(
      createVoucherDto,
      CreateVoucherDto,
      Voucher,
    );
    voucher.remainingUsage = voucher.maxUsage;
    voucher.voucherGroup = voucherGroup;
    if (voucher.type === VoucherType.PERCENT_ORDER) {
      voucher.valueType = VoucherValueType.PERCENTAGE;
      if (voucher.value > 100) {
        this.logger.warn(
          VoucherValidation.INVALID_VOUCHER_VALUE.message,
          context,
        );
        throw new VoucherException(VoucherValidation.INVALID_VOUCHER_VALUE);
      }
    } else if (
      voucher.type === VoucherType.FIXED_VALUE ||
      voucher.type === VoucherType.SAME_PRICE_PRODUCT
    ) {
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

    const voucherProducts: VoucherProduct[] = await Promise.all(
      productSlugs.map(async (slug) => {
        const product = await this.productUtils.getProduct({ where: { slug } });
        const voucherProduct = new VoucherProduct();
        voucherProduct.voucher = voucher;
        voucherProduct.product = product;
        return voucherProduct;
      }),
    );

    const voucherPaymentMethods: VoucherPaymentMethod[] = paymentMethods.map(
      (method) => {
        const voucherPaymentMethod = new VoucherPaymentMethod();
        switch (method) {
          case PaymentMethod.BANK_TRANSFER:
            voucherPaymentMethod.paymentMethod = PaymentMethod.BANK_TRANSFER;
            break;
          case PaymentMethod.CASH:
            voucherPaymentMethod.paymentMethod = PaymentMethod.CASH;
            break;
          case PaymentMethod.POINT:
            voucherPaymentMethod.paymentMethod = PaymentMethod.POINT;
            break;
          case PaymentMethod.CREDIT_CARD:
            voucherPaymentMethod.paymentMethod = PaymentMethod.CREDIT_CARD;
            break;
        }

        return voucherPaymentMethod;
      },
    );

    voucher.voucherPaymentMethods = voucherPaymentMethods;

    const createdVoucher = await this.transactionService.execute<Voucher>(
      async (manager) => {
        const createdVoucher = await manager.save(voucher);
        await manager.save(voucherProducts);
        return createdVoucher;
      },
      (result) => {
        this.logger.log(
          `Voucher created successfully: ${JSON.stringify(result)}`,
          context,
        );
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

    this.voucherUtils.validateInitiateVoucherUserGroup(
      bulkCreateVoucherDto.isVerificationIdentity,
      bulkCreateVoucherDto.isUserGroup,
    );

    const numberOfVoucher = bulkCreateVoucherDto.numberOfVoucher;

    const productSlugs = bulkCreateVoucherDto.products;
    const paymentMethods = bulkCreateVoucherDto.paymentMethods;

    const voucherTemplate = this.mapper.map(
      bulkCreateVoucherDto,
      BulkCreateVoucherDto,
      Voucher,
    );
    voucherTemplate.remainingUsage = voucherTemplate.maxUsage;
    voucherTemplate.voucherGroup = voucherGroup;

    if (voucherTemplate.type === VoucherType.PERCENT_ORDER) {
      voucherTemplate.valueType = VoucherValueType.PERCENTAGE;
      if (voucherTemplate.value > 100) {
        this.logger.warn(
          VoucherValidation.INVALID_VOUCHER_VALUE.message,
          context,
        );
        throw new VoucherException(VoucherValidation.INVALID_VOUCHER_VALUE);
      }
    } else if (
      voucherTemplate.type === VoucherType.FIXED_VALUE ||
      voucherTemplate.type === VoucherType.SAME_PRICE_PRODUCT
    ) {
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

    const voucherPaymentMethods: VoucherPaymentMethod[] = paymentMethods.map(
      (method) => {
        const voucherPaymentMethod = new VoucherPaymentMethod();
        switch (method) {
          case PaymentMethod.BANK_TRANSFER:
            voucherPaymentMethod.paymentMethod = PaymentMethod.BANK_TRANSFER;
            break;
          case PaymentMethod.CASH:
            voucherPaymentMethod.paymentMethod = PaymentMethod.CASH;
            break;
          case PaymentMethod.POINT:
            voucherPaymentMethod.paymentMethod = PaymentMethod.POINT;
            break;
          case PaymentMethod.CREDIT_CARD:
            voucherPaymentMethod.paymentMethod = PaymentMethod.CREDIT_CARD;
            break;
        }

        return voucherPaymentMethod;
      },
    );

    voucherTemplate.voucherPaymentMethods = voucherPaymentMethods;

    const vouchers = [];
    for (let i = 0; i < numberOfVoucher; i++) {
      const voucher = _.cloneDeep(voucherTemplate);
      voucher.code = `${getRandomString()}${i}`;
      vouchers.push(voucher);
    }

    const createdVouchers = await this.transactionService.execute<Voucher[]>(
      async (manager) => {
        const createdVouchers = await manager.save(vouchers);
        const createdVoucherProducts: VoucherProduct[] = [];
        for (const voucher of createdVouchers) {
          const voucherProducts: VoucherProduct[] = await Promise.all(
            productSlugs.map(async (slug) => {
              const product = await this.productUtils.getProduct({
                where: { slug },
              });
              const voucherProduct = new VoucherProduct();
              voucherProduct.voucher = voucher;
              voucherProduct.product = product;
              return voucherProduct;
            }),
          );
          createdVoucherProducts.push(...voucherProducts);
        }
        await manager.save(createdVoucherProducts);
        return createdVouchers;
      },
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
      const dateQuery = options.date;
      // dateQuery.setHours(7, 0, 0, 0);
      findOptionsWhere.startDate = LessThanOrEqual(dateQuery);
      findOptionsWhere.endDate = MoreThanOrEqual(dateQuery);
    }

    if (!_.isNil(options.isActive))
      findOptionsWhere.isActive = options.isActive;

    if (!_.isNil(options.isVerificationIdentity))
      findOptionsWhere.isVerificationIdentity = options.isVerificationIdentity;

    if (!_.isNil(options.paymentMethod))
      findOptionsWhere.voucherPaymentMethods = {
        paymentMethod: options.paymentMethod,
      };

    try {
      const findManyOptions: FindManyOptions<Voucher> = {
        where: findOptionsWhere,
        order: {
          createdAt: 'DESC',
        },
        relations: [
          'voucherProducts.product.variants',
          'voucherPaymentMethods',
        ],
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

  async findAllForUserEligible(
    options: GetAllVoucherForUserEligibleDto,
  ): Promise<AppPaginatedResponseDto<VoucherResponseDto>> {
    const context = `${VoucherService.name}.${this.findAllForUserEligible.name}`;
    this.logger.log(`Find all vouchers for user`, context);
    const user = await this.userRepository.findOne({
      where: { slug: options.user ?? IsNull() },
      relations: {
        role: true,
      },
    });
    const variantSlugs = options.orderItems.map((item) => item.variant);
    const products = await this.productRepository.find({
      where: { variants: { slug: In([...new Set(variantSlugs)]) } },
    });
    const productIds = products.map((product) => product.id);
    const paymentMethod: string | undefined = options.paymentMethod;
    const now = new Date(); // plus grace period time voucher

    const qb: SelectQueryBuilder<Voucher> = this.voucherRepository
      .createQueryBuilder('voucher')
      .select([
        'voucher.id',
        'voucher.type',
        'voucher.applicabilityRule',
        'voucher.minOrderValue',
        'voucher.isPrivate',
        'voucher.isUserGroup',
        'voucher.remainingUsage',
      ])
      .where('voucher.isActive = true')
      .andWhere('voucher.isPrivate = false')
      .andWhere('voucher.startDate <= :now', { now })
      .andWhere('voucher.endDate >= :now', { now })
      .andWhere('voucher.remainingUsage > 0');
    if (
      user &&
      user.role?.name === RoleEnum.Customer &&
      user.phonenumber !== 'default-customer'
    ) {
      qb.leftJoin('voucher.voucherUserGroups', 'vug')
        .leftJoin('vug.userGroup', 'ug')
        .leftJoin('ug.userGroupMembers', 'ugm')
        .andWhere(
          new Brackets((qb) => {
            qb.where('voucher.isUserGroup = false').orWhere(
              new Brackets((sub) => {
                sub
                  .where('voucher.isUserGroup = true')
                  .andWhere('ugm.user = :userId', { userId: user.id });
              }),
            );
          }),
        );
    } else {
      qb.andWhere('voucher.isVerificationIdentity = false').andWhere(
        'voucher.isUserGroup = false',
      );
    }

    // by min order value
    qb.andWhere(
      new Brackets((qb) => {
        qb.where(
          new Brackets((sub1) => {
            sub1
              .where('voucher.applicabilityRule = :rule1', {
                rule1: VoucherApplicabilityRule.ALL_REQUIRED,
              })
              .andWhere('voucher.type <> :type', {
                type: VoucherType.SAME_PRICE_PRODUCT,
              })
              .andWhere('voucher.minOrderValue <= :subtotal', {
                subtotal: options.minOrderValue,
              });
          }),
        )
          .orWhere(
            new Brackets((sub2) => {
              sub2
                .where('voucher.applicabilityRule = :rule2', {
                  rule2: VoucherApplicabilityRule.ALL_REQUIRED,
                })
                .andWhere('voucher.type = :type', {
                  type: VoucherType.SAME_PRICE_PRODUCT,
                });
            }),
          )
          .orWhere('voucher.applicabilityRule = :rule3', {
            rule3: VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED,
          });
      }),
    );

    if (productIds?.length) {
      const uniqueProductIds = [...new Set(productIds)];
      const cartCount = uniqueProductIds.length;

      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where(
              new Brackets((q1) => {
                q1.where('voucher.applicabilityRule = :rule4', {
                  rule4: VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED,
                }).andWhere(
                  `
                  EXISTS (
                    SELECT 1
                    FROM voucher_product_tbl vp1
                    WHERE vp1.voucher_column = voucher.id_column
                    AND vp1.deleted_at_column IS NULL
                    AND vp1.product_column IN (:...productIds)
                )`,
                  { productIds },
                );
              }),
            )
            .orWhere(
              new Brackets((q2) => {
                q2.where('voucher.applicabilityRule = :rule5', {
                  rule5: VoucherApplicabilityRule.ALL_REQUIRED,
                }).andWhere(
                  `
                  voucher.id_column IN (
                    SELECT vp2.voucher_column
                    FROM voucher_product_tbl vp2
                    WHERE vp2.product_column IN (:...productIdsForAll)
                    AND vp2.deleted_at_column IS NULL
                    GROUP BY vp2.voucher_column
                    HAVING COUNT(DISTINCT vp2.product_column) = :cartCount
                  )
                `,
                  { productIdsForAll: uniqueProductIds, cartCount },
                );
              }),
            );
        }),
      );
    }

    if (paymentMethod) {
      qb.andWhere(
        `EXISTS (
        SELECT 1
        FROM voucher_payment_method_tbl vpm2
        WHERE vpm2.voucher_column = voucher.id_column
        AND vpm2.payment_method_column = :paymentMethod
        AND vpm2.deleted_at_column IS NULL
      )`,
        { paymentMethod },
      );
    }

    // distinct voucher
    qb.distinct(true);

    if (options?.hasPaging) {
      qb.skip((options.page - 1) * options.size).take(options.size);
    }

    const [vouchers, total] = await qb.getManyAndCount();

    const voucherIds = vouchers.map((voucher) => voucher.id);

    const voucherResults = await this.voucherRepository.find({
      where: { id: In(voucherIds) },
      relations: {
        voucherProducts: {
          product: {
            variants: true,
          },
        },
        voucherPaymentMethods: true,
      },
    });

    const totalPages = Math.ceil(total / options.size);
    const hasNext = options.page < totalPages;
    const hasPrevious = options.page > 1;
    const vouchersDto = this.mapper.mapArray(
      voucherResults,
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
      const dateQuery = options.date;
      // dateQuery.setHours(7, 0, 0, 0);
      findOptionsWhere.startDate = LessThanOrEqual(dateQuery);
      findOptionsWhere.endDate = MoreThanOrEqual(dateQuery);
    }

    if (!_.isNil(options.isActive))
      findOptionsWhere.isActive = options.isActive;

    if (!_.isNil(options.paymentMethod))
      findOptionsWhere.voucherPaymentMethods = {
        paymentMethod: options.paymentMethod,
      };

    try {
      const findManyOptions: FindManyOptions<Voucher> = {
        where: findOptionsWhere,
        order: {
          createdAt: 'DESC',
        },
        relations: [
          'voucherProducts.product.variants',
          'voucherPaymentMethods',
        ],
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

    const findOptionsWhere: FindOptionsWhere<Voucher> = {};

    if (!_.isNil(options.voucherGroup)) {
      const voucherGroup = await this.voucherGroupUtils.getVoucherGroup({
        where: { slug: options.voucherGroup },
      });

      findOptionsWhere.voucherGroup = { slug: voucherGroup.slug };
    }

    if (!_.isNil(options.userGroup)) {
      const userGroup = await this.userGroupRepository.findOne({
        where: { slug: options.userGroup },
        relations: {
          voucherUserGroups: { voucher: true },
        },
      });
      if (!userGroup) {
        this.logger.warn('User group not found', context);
        throw new UserGroupException(UserGroupValidation.USER_GROUP_NOT_FOUND);
      }

      const voucherIds = userGroup.voucherUserGroups.map(
        (item) => item.voucher.id,
      );

      findOptionsWhere.id = options.isAppliedUserGroup
        ? In(voucherIds)
        : Not(In(voucherIds));
    }

    if (!_.isNil(options.minOrderValue))
      findOptionsWhere.minOrderValue = MoreThanOrEqual(options.minOrderValue);

    if (!_.isNil(options.date)) {
      const dateQuery = options.date;
      // dateQuery.setHours(7, 0, 0, 0);
      findOptionsWhere.startDate = LessThanOrEqual(dateQuery);
      findOptionsWhere.endDate = MoreThanOrEqual(dateQuery);
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
          code: 'ASC',
        },
        relations: ['voucherPaymentMethods'],
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
      relations: ['voucherProducts.product.variants', 'voucherPaymentMethods'],
    });
    return this.mapper.map(voucher, Voucher, VoucherResponseDto);
  }

  async update(slug: string, updateVoucherDto: UpdateVoucherDto) {
    const context = `${VoucherService.name}.${this.update.name}`;

    const voucher = await this.voucherUtils.getVoucher({
      where: { slug },
      relations: { voucherUserGroups: true },
    });
    const voucherGroup = await this.voucherGroupUtils.getVoucherGroup({
      where: { slug: updateVoucherDto.voucherGroup },
    });

    this.voucherUtils.validateInitiateVoucherUserGroup(
      updateVoucherDto.isVerificationIdentity,
      updateVoucherDto.isUserGroup,
    );

    if (!_.isEmpty(voucher.voucherUserGroups)) {
      if (!updateVoucherDto.isUserGroup) {
        this.logger.warn(
          `Voucher has user group can not update is user group`,
          context,
        );
        throw new VoucherException(
          VoucherValidation.VOUCHER_HAS_USER_GROUP_CAN_NOT_UPDATE_IS_USER_GROUP,
        );
      }
      // this condition is included in validateInitiateVoucherUserGroup() function above
      if (!updateVoucherDto.isVerificationIdentity) {
        this.logger.warn(
          `Voucher has user group can not update is verification identity`,
          context,
        );
        throw new VoucherException(
          VoucherValidation.VOUCHER_HAS_USER_GROUP_CAN_NOT_UPDATE_IS_VERIFICATION_IDENTITY,
        );
      }
    }

    if (voucher.isUserGroup !== updateVoucherDto.isUserGroup) {
      const orders = await this.orderUtils.getBulkOrders({
        where: { voucher: { slug } },
      });
      if (!_.isEmpty(orders)) {
        this.logger.error(
          'Voucher has used can not update is user group',
          null,
          context,
        );
        throw new VoucherException(
          VoucherValidation.VOUCHER_HAS_USED_CAN_NOT_UPDATE_IS_USER_GROUP,
        );
      }
    }

    if (voucher.type === VoucherType.PERCENT_ORDER) {
      if (voucher.value > 100) {
        this.logger.warn(
          VoucherValidation.INVALID_VOUCHER_VALUE.message,
          context,
        );
        throw new VoucherException(VoucherValidation.INVALID_VOUCHER_VALUE);
      }
    }

    if (voucher.maxUsage !== updateVoucherDto.maxUsage) {
      const orders = await this.orderUtils.getBulkOrders({
        where: { voucher: { slug } },
      });
      if (!_.isEmpty(orders)) {
        this.logger.error(
          'Voucher has used can not update max usage',
          null,
          context,
        );
        throw new VoucherException(
          VoucherValidation.VOUCHER_HAS_USED_CAN_NOT_UPDATE_MAX_USAGE,
        );
      }
    }

    Object.assign(voucher, updateVoucherDto);
    voucher.voucherGroup = voucherGroup;
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
      relations: ['orders'],
    });
    if (_.size(voucher.orders) > 0) {
      this.logger.error('Voucher has orders', null, context);
      throw new VoucherException(VoucherValidation.VOUCHER_HAS_ORDERS);
    }
    const deletedVoucher = await this.transactionService.execute<Voucher>(
      async (manager) => await manager.softRemove(voucher),
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

  async exportPdf(exportPdfVoucherDto: ExportPdfVoucherDto) {
    const context = `${VoucherService.name}.${this.exportPdf.name}`;

    const vouchers = await this.voucherRepository.find({
      where: { slug: In(exportPdfVoucherDto.vouchers) },
    });
    if (_.isEmpty(vouchers)) {
      this.logger.error('Vouchers not found', null, context);
      throw new VoucherException(VoucherValidation.VOUCHER_NOT_FOUND);
    }

    const buffers: Buffer[] = [];
    for (const voucher of vouchers) {
      const qrCode = await this.qrCodeService.generateQRCode(voucher.code);
      const data = await this.pdfService.generatePdf(
        'voucher-ticket',
        {
          code: voucher.code,
          startDate: moment(voucher.startDate).format('DD/MM/YYYY'),
          endDate: moment(voucher.endDate).format('DD/MM/YYYY'),
          qrCode,
        },
        {
          width: '50mm',
          height: '30mm',
          preferCSSPageSize: true,
          margin: {
            top: '0cm',
            bottom: '0cm',
            left: '0cm',
            right: '0cm',
          },
          scale: 1,
        },
      );
      buffers.push(data);
    }

    const mergedPdf = await this.mergePdfBuffers(buffers);

    return mergedPdf;
  }

  public async mergePdfBuffers(buffers: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();

    for (const buffer of buffers) {
      const pdf = await PDFDocument.load(buffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const finalPdf = await mergedPdf.save();
    return Buffer.from(finalPdf);
  }

  async addVoucherPaymentMethod(
    slug: string,
    requestData: AddVoucherPaymentMethodRequestDto,
  ): Promise<VoucherPaymentMethodResponseDto> {
    const context = `${VoucherService.name}.${this.addVoucherPaymentMethod.name}`;
    const voucher = await this.voucherUtils.getVoucher({
      where: { slug },
      relations: ['voucherPaymentMethods'],
    });

    const existingPaymentMethod = voucher.voucherPaymentMethods.find(
      (voucherPaymentMethod) =>
        voucherPaymentMethod.paymentMethod === requestData.paymentMethod,
    );

    if (existingPaymentMethod) {
      this.logger.warn('Voucher payment method already exists', null, context);
      throw new VoucherException(
        VoucherValidation.VOUCHER_PAYMENT_METHOD_ALREADY_EXISTS,
      );
    }

    const voucherPaymentMethod = new VoucherPaymentMethod();
    voucherPaymentMethod.paymentMethod = requestData.paymentMethod;
    voucherPaymentMethod.voucher = voucher;

    const createdVoucherPaymentMethod =
      await this.transactionService.execute<VoucherPaymentMethod>(
        async (manager) => await manager.save(voucherPaymentMethod),
        (result) =>
          this.logger.log(
            `Voucher payment method created successfully: ${result}`,
            context,
          ),
        (error) => {
          this.logger.error(
            `Failed to create voucher payment method: ${error.message}`,
            error.stack,
            context,
          );
          throw new VoucherException(
            VoucherValidation.CREATE_VOUCHER_PAYMENT_METHOD_FAILED,
            error.message,
          );
        },
      );
    return this.mapper.map(
      createdVoucherPaymentMethod,
      VoucherPaymentMethod,
      VoucherPaymentMethodResponseDto,
    );
  }

  async removeVoucherPaymentMethod(
    slug: string,
    requestData: RemoveVoucherPaymentMethodRequestDto,
  ): Promise<VoucherPaymentMethodResponseDto> {
    const context = `${VoucherService.name}.${this.removeVoucherPaymentMethod.name}`;

    const voucher = await this.voucherUtils.getVoucher({
      where: { slug },
      relations: ['voucherPaymentMethods'],
    });

    const voucherPaymentMethod = voucher.voucherPaymentMethods.find(
      (voucherPaymentMethod) =>
        voucherPaymentMethod.paymentMethod === requestData.paymentMethod,
    );

    if (!voucherPaymentMethod) {
      this.logger.warn('Voucher payment method not found', null, context);
      throw new VoucherException(
        VoucherValidation.VOUCHER_PAYMENT_METHOD_NOT_FOUND,
      );
    }

    if (voucher.voucherPaymentMethods.length === 1) {
      this.logger.warn(
        'Voucher must have at least one payment method',
        null,
        context,
      );
      throw new VoucherException(
        VoucherValidation.VOUCHER_MUST_HAVE_AT_LEAST_ONE_PAYMENT_METHOD,
      );
    }

    const deletedVoucherPaymentMethod =
      await this.transactionService.execute<VoucherPaymentMethod>(
        async (manager) => await manager.softRemove(voucherPaymentMethod),
        (result) =>
          this.logger.log(
            `Voucher payment method deleted successfully: ${result}`,
            context,
          ),
        (error) => {
          this.logger.error(
            `Failed to delete voucher payment method: ${error.message}`,
            error.stack,
            context,
          );
          throw new VoucherException(
            VoucherValidation.DELETE_VOUCHER_PAYMENT_METHOD_FAILED,
            error.message,
          );
        },
      );
    return this.mapper.map(
      deletedVoucherPaymentMethod,
      VoucherPaymentMethod,
      VoucherPaymentMethodResponseDto,
    );
  }

  async validateVoucherPaymentMethod(
    requestData: ValidateVoucherPaymentMethodDto,
  ): Promise<boolean> {
    const context = `${VoucherService.name}.${this.validateVoucherPaymentMethod.name}`;
    this.logger.log(
      `Validate voucher payment method: ${JSON.stringify(requestData)}`,
      context,
    );
    // order has no voucher
    if (!requestData.slug) return true;

    const voucher = await this.voucherUtils.getVoucher({
      where: { slug: requestData.slug },
      relations: ['voucherPaymentMethods'],
    });

    return this.voucherUtils.validateVoucherPaymentMethod(
      voucher,
      requestData.paymentMethod,
    );
  }
}
