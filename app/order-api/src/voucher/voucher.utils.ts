import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { Voucher } from './voucher.entity';
import { VoucherException } from './voucher.exception';
import { VoucherValidation } from './voucher.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Order } from 'src/order/order.entity';
import { OrderUtils } from 'src/order/order.utils';
import { UserUtils } from 'src/user/user.utils';
import { RoleEnum } from 'src/role/role.enum';
import _ from 'lodash';

@Injectable()
export class VoucherUtils {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly orderUtils: OrderUtils,
    private readonly userUtils: UserUtils,
  ) {}

  async getVoucher(options: FindOneOptions<Voucher>): Promise<Voucher> {
    const context = `${VoucherUtils.name}.${this.getVoucher.name}`;

    try {
      const voucher = await this.voucherRepository.findOne({
        ...options,
      });
      if (!voucher) {
        this.logger.warn(`Voucher not found`, context);
        throw new VoucherException(VoucherValidation.VOUCHER_NOT_FOUND);
      }
      return voucher;
    } catch (error) {
      this.logger.error(error.message, error.stack, context);
      throw new VoucherException(
        VoucherValidation.FIND_ONE_VOUCHER_FAILED,
        error.message,
      );
    }
  }

  async getBulkVouchers(options: FindManyOptions<Voucher>): Promise<Voucher[]> {
    const vouchers = await this.voucherRepository.find({
      order: {
        createdAt: 'ASC',
      },
      ...options,
    });

    return vouchers;
  }

  // validate number of voucher
  async validateVoucher(voucher: Voucher): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateVoucher.name}`;
    if (!voucher.isActive) {
      this.logger.warn(`Voucher ${voucher.slug} is not active`, context);
      throw new VoucherException(VoucherValidation.VOUCHER_IS_NOT_ACTIVE);
    }

    if (voucher.remainingUsage === 0) {
      this.logger.warn(
        `Voucher ${voucher.slug} has no remaining usage`,
        context,
      );
      throw new VoucherException(
        VoucherValidation.VOUCHER_HAS_NO_REMAINING_USAGE,
      );
    }

    return true;
  }

  async validateVoucherUsage(
    voucher: Voucher,
    userSlug?: string,
  ): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateVoucherUsage.name}`;

    if (userSlug) {
      // user login
      const user = await this.userUtils.getUser({
        where: {
          slug: userSlug ?? IsNull(),
          phonenumber: Not('default-customer'),
        },
        relations: ['role'],
      });

      if (user.role.name === RoleEnum.Customer) {
        // user order
        if (voucher.isVerificationIdentity) {
          const orders = await this.orderUtils.getBulkOrders({
            where: {
              owner: {
                slug: user.slug,
              },
              voucher: {
                slug: voucher.slug,
              },
            },
          });

          if (_.size(orders) >= voucher.numberOfUsagePerUser) {
            this.logger.warn(
              `Voucher ${voucher.slug} is already used`,
              context,
            );
            throw new VoucherException(VoucherValidation.VOUCHER_ALREADY_USED);
          }
        }
        this.logger.log('Validate voucher success', context);
        return true;
      } else {
        // staff order for user
        if (voucher.isVerificationIdentity) {
          this.logger.warn(
            `Voucher ${voucher.slug} must verify identity to use voucher`,
            context,
          );
          throw new VoucherException(
            VoucherValidation.MUST_VERIFY_IDENTITY_TO_USE_VOUCHER,
          );
        }
      }
      this.logger.log('Validate voucher success', context);
      return true;
    } else {
      // user not login
      if (voucher.isVerificationIdentity) {
        this.logger.warn(
          `Voucher ${voucher.slug} must verify identity to use voucher`,
          context,
        );
        throw new VoucherException(
          VoucherValidation.MUST_VERIFY_IDENTITY_TO_USE_VOUCHER,
        );
      }

      this.logger.log('Validate voucher success', context);
      return true;
    }
  }

  // validate how to use voucher
  // user is null when validate voucher for guest (default customer) - no login
  // user is not null when validate voucher for user (customer) - login
  // async validateVoucherUsage(
  //   voucher: Voucher,
  //   user?: string,
  // ): Promise<boolean> {
  //   const context = `${VoucherUtils.name}.${this.validateVoucherUsage.name}`;
  //   if (user) {
  //     switch (voucher.type) {
  //       case VoucherType.PERCENT_ORDER:
  //         if (voucher.isVerificationIdentity) {
  //           await this.validateVerificationIdentityVoucher(voucher, user);
  //         }

  //         this.logger.log('Validate voucher success', context);
  //         return true;
  //       case VoucherType.FIXED_VALUE:
  //         if (voucher.isVerificationIdentity) {
  //           await this.validateVerificationIdentityVoucher(voucher, user);
  //         }

  //         this.logger.log('Validate voucher success', context);
  //         return true;
  //       default:
  //         this.logger.warn(
  //           VoucherValidation.INVALID_VOUCHER_TYPE.message,
  //           context,
  //         );
  //         throw new VoucherException(VoucherValidation.INVALID_VOUCHER_TYPE);
  //     }
  //   } else {
  //     if (voucher.isVerificationIdentity) {
  //       this.logger.warn(
  //         `Voucher ${voucher.slug} must verify identity to use voucher`,
  //         context,
  //       );
  //       throw new VoucherException(
  //         VoucherValidation.MUST_VERIFY_IDENTITY_TO_USE_VOUCHER,
  //       );
  //     }

  //     this.logger.log('Validate voucher success', context);
  //     return true;
  //   }
  // }

  // async validateVerificationIdentityVoucher(voucher: Voucher, user: string) {
  //   const context = `${VoucherUtils.name}.${this.validateVerificationIdentityVoucher.name}`;
  //   try {
  //     // We will check customer has already used voucher
  //     // If User are employee, admin, ... roles => No login. Can't use voucher directly
  //     // that must verify by owner is customer

  //     // Include exception found user or not found user
  //     const owner = await this.userUtils.getUser({
  //       where: {
  //         slug: user ?? IsNull(),
  //       },
  //       relations: ['role'],
  //     });

  //     if (owner.role.name !== RoleEnum.Customer) {
  //       this.logger.warn(`User ${owner.slug} is not customer`, context);
  //       throw new VoucherException(VoucherValidation.USER_MUST_BE_CUSTOMER);
  //     }

  //     const orders = await this.orderUtils.getBulkOrders({
  //       where: {
  //         owner: {
  //           slug: owner.slug,
  //         },
  //         voucher: {
  //           slug: voucher.slug,
  //         },
  //       },
  //     });

  //     if (_.size(orders) >= voucher.numberOfUsagePerUser) {
  //       this.logger.warn(`Voucher ${voucher.slug} is already used`, context);
  //       throw new VoucherException(VoucherValidation.VOUCHER_ALREADY_USED);
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       VoucherValidation.VALIDATE_VOUCHER_USAGE_FAILED.message,
  //       error.stack,
  //       context,
  //     );
  //     throw new VoucherException(
  //       VoucherValidation.VALIDATE_VOUCHER_USAGE_FAILED,
  //       error.message,
  //     );
  //   }
  // }

  // validate min order value
  async validateMinOrderValue(
    voucher: Voucher,
    order: Order,
  ): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateMinOrderValue.name}`;
    const subtotal = await this.orderUtils.getOrderSubtotal(order);
    if (voucher.minOrderValue > subtotal) {
      this.logger.warn(
        `Order value is less than min order value of voucher`,
        context,
      );
      throw new VoucherException(
        VoucherValidation.ORDER_VALUE_LESS_THAN_MIN_ORDER_VALUE,
      );
    }
    return true;
  }
}
