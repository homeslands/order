import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Voucher } from './voucher.entity';
import { VoucherException } from './voucher.exception';
import { VoucherValidation } from './voucher.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Order } from 'src/order/order.entity';
import { OrderUtils } from 'src/order/order.utils';

@Injectable()
export class VoucherUtils {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly orderUtils: OrderUtils,
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
    let order = null;
    try {
      order = await this.orderUtils.getOrder({
        where: {
          owner: {
            slug: user,
          },
          voucher: {
            slug: voucher.slug,
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}

    if (order) {
      throw new VoucherException(VoucherValidation.VOUCHER_ALREADY_USED);
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
