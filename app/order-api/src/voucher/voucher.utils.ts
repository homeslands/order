import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Voucher } from './voucher.entity';
import { VoucherException } from './voucher.exception';
import { VoucherValidation } from './voucher.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Order } from 'src/order/order.entity';
import { OrderUtils } from 'src/order/order.utils';
import { UserUtils } from 'src/user/user.utils';
import { RoleEnum } from 'src/role/role.enum';

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
      return voucher;
    } catch (error) {
      this.logger.error(error.message, error.stack, context);
      throw new VoucherException(
        VoucherValidation.FIND_ONE_VOUCHER_FAILED,
        error.message,
      );
    }
  }

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

  async validateVoucherUsage(voucher: Voucher, user: string): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateVoucherUsage.name}`;
    if (voucher.isVerificationIdentity) {
      try {
        // We will check customer has already used voucher
        // If User are employee, admin, ... roles => No login. Can't use voucher directly
        // that must verify by owner is customer
        const owner = await this.userUtils.getUser({
          where: {
            slug: user,
          },
          relations: ['role'],
        });

        if (owner.role.name !== RoleEnum.Customer) {
          this.logger.warn(`User ${owner.slug} is not customer`, context);
          throw new VoucherException(VoucherValidation.USER_MUST_BE_CUSTOMER);
        }

        const order = await this.orderUtils.getOrder({
          where: {
            owner: {
              slug: owner.slug,
            },
            voucher: {
              slug: voucher.slug,
            },
          },
        });

        if (order) {
          this.logger.warn(`Voucher ${voucher.slug} is already used`, context);
          throw new VoucherException(VoucherValidation.VOUCHER_ALREADY_USED);
        }
      } catch (error) {
        this.logger.error(
          VoucherValidation.VALIDATE_VOUCHER_USAGE_FAILED.message,
          error.stack,
          context,
        );
        throw new VoucherException(
          VoucherValidation.VALIDATE_VOUCHER_USAGE_FAILED,
          error.message,
        );
      }
    }

    return true;
  }

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
