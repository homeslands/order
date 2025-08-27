import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { Voucher } from './entity/voucher.entity';
import { VoucherException } from './voucher.exception';
import { VoucherValidation } from './voucher.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Order } from 'src/order/order.entity';
import { OrderUtils } from 'src/order/order.utils';
import { UserUtils } from 'src/user/user.utils';
import { RoleEnum } from 'src/role/role.enum';
import _ from 'lodash';
import { ProductUtils } from 'src/product/product.utils';
import { VoucherProduct } from 'src/voucher-product/voucher-product.entity';
import { VoucherApplicabilityRule, VoucherType } from './voucher.constant';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';
import moment from 'moment';

@Injectable()
export class VoucherUtils {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(VoucherProduct)
    private readonly voucherProductRepository: Repository<VoucherProduct>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly orderUtils: OrderUtils,
    private readonly userUtils: UserUtils,
    private readonly productUtils: ProductUtils,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getGracePeriodVoucher() {
    const gracePeriodVoucher = await this.systemConfigService.get(
      SystemConfigKey.GRACE_PERIOD_VOUCHER,
    );
    if (!gracePeriodVoucher) return 30 * 60 * 1000; // 30 minutes
    return Number(gracePeriodVoucher);
  }

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
    // if (!voucher.isActive) {
    //   this.logger.warn(`Voucher ${voucher.slug} is not active`, context);
    //   throw new VoucherException(VoucherValidation.VOUCHER_IS_NOT_ACTIVE);
    // }

    // don't use isActive - isActive for get voucher and display when get specific
    // Because: have grace period
    const gracePeriodVoucher = await this.getGracePeriodVoucher();
    const gracePeriodVoucherByMinutes = gracePeriodVoucher / 60000;
    const today = new Date();
    if (voucher.startDate > today) {
      this.logger.warn(`Voucher ${voucher.slug} is not started`, context);
      throw new VoucherException(VoucherValidation.VOUCHER_IS_NOT_STARTED);
    }
    // add grace period
    if (
      moment(voucher.endDate)
        .add(gracePeriodVoucherByMinutes, 'minutes')
        .toDate() < today
    ) {
      this.logger.warn(`Voucher ${voucher.slug} is expired`, context);
      throw new VoucherException(VoucherValidation.VOUCHER_IS_EXPIRED);
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

  async validateVoucherTime(voucher: Voucher): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateVoucherTime.name}`;
    const gracePeriodVoucher = await this.getGracePeriodVoucher();
    const gracePeriodVoucherByMinutes = gracePeriodVoucher / 60000;
    const today = new Date();
    if (voucher.startDate > today) {
      this.logger.warn(`Voucher ${voucher.slug} is not started`, context);
      throw new VoucherException(VoucherValidation.VOUCHER_IS_NOT_STARTED);
    }
    // add grace period
    if (
      moment(voucher.endDate)
        .add(gracePeriodVoucherByMinutes, 'minutes')
        .toDate() < today
    ) {
      this.logger.warn(`Voucher ${voucher.slug} is expired`, context);
      throw new VoucherException(VoucherValidation.VOUCHER_IS_EXPIRED);
    }

    return true;
  }

  async isVoucherTimeValid(voucher: Voucher): Promise<boolean> {
    const gracePeriodVoucher = await this.getGracePeriodVoucher();
    const gracePeriodVoucherByMinutes = gracePeriodVoucher / 60000;
    const today = new Date();
    if (voucher.startDate > today) return false;
    // add grace period
    if (
      moment(voucher.endDate)
        .add(gracePeriodVoucherByMinutes, 'minutes')
        .toDate() < today
    )
      return false;

    return true;
  }

  validateVoucherRemainingUsage(voucher: Voucher): boolean {
    const context = `${VoucherUtils.name}.${this.validateVoucherRemainingUsage.name}`;
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

    // validate voucher for user
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
          // check user already verify email or not
          if (!user.isVerifiedEmail && !user.isVerifiedPhonenumber) {
            this.logger.warn(
              `User ${user.slug} must verify email or phone number to use voucher`,
              context,
            );
            throw new VoucherException(
              VoucherValidation.MUST_VERIFY_EMAIL_OR_PHONE_NUMBER_TO_USE_VOUCHER,
            );
          }

          // check number of voucher used by user
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

  async validateVoucherProduct(
    voucher: Voucher,
    variants: string[],
  ): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateVoucherProduct.name}`;
    const productSlugs: string[] = [];
    for (const variant of variants) {
      const product = await this.productUtils.getProduct({
        where: { variants: { slug: variant } },
      });
      productSlugs.push(product.slug);
    }

    switch (voucher.applicabilityRule) {
      case VoucherApplicabilityRule.ALL_REQUIRED:
        for (const productSlug of productSlugs) {
          const voucherProduct = voucher?.voucherProducts.find(
            (voucherProduct) => voucherProduct.product.slug === productSlug,
          );
          if (!voucherProduct) {
            this.logger.warn(
              `Product ${productSlug} not applied to voucher ${voucher.slug}`,
              context,
            );
            throw new VoucherException(
              VoucherValidation.ALL_PRODUCT_MUST_BE_APPLIED_TO_VOUCHER,
            );
          }
        }
        return true;

      case VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED:
        const voucherProducts = await this.voucherProductRepository.find({
          where: {
            product: {
              slug: In(productSlugs),
            },
            voucher: {
              slug: voucher.slug,
            },
          },
        });

        if (_.size(voucherProducts) < 1) {
          this.logger.warn(
            `Product not applied to voucher ${voucher.slug}`,
            context,
          );
          throw new VoucherException(
            VoucherValidation.AT_LEAST_ONE_PRODUCT_MUST_BE_APPLIED_TO_VOUCHER,
          );
        }
        return true;

      default:
        this.logger.warn(
          `Invalid voucher applicability rule ${voucher.slug}`,
          context,
        );
        throw new VoucherException(
          VoucherValidation.INVALID_VOUCHER_APPLICABILITY_RULE,
        );
    }
    // switch (voucher.type) {
    //   case VoucherType.SAME_PRICE_PRODUCT:
    //     const voucherProducts = await this.voucherProductRepository.find({
    //       where: {
    //         product: {
    //           slug: In(productSlugs),
    //         },
    //         voucher: {
    //           slug: voucher.slug,
    //         },
    //       },
    //     });

    //     if (_.size(voucherProducts) < 1) {
    //       this.logger.warn(
    //         `Product not applied to voucher ${voucher.slug}`,
    //         context,
    //       );
    //       throw new VoucherException(
    //         VoucherValidation.PRODUCT_NOT_APPLIED_TO_VOUCHER,
    //       );
    //     }
    //     return true;
    //   case VoucherType.PERCENT_ORDER:
    //   case VoucherType.FIXED_VALUE:
    //     for (const productSlug of productSlugs) {
    //       const voucherProduct = voucher?.voucherProducts.find(
    //         (voucherProduct) => voucherProduct.product.slug === productSlug,
    //       );
    //       if (!voucherProduct) {
    //         this.logger.warn(
    //           `Product ${productSlug} not applied to voucher ${voucher.slug}`,
    //           context,
    //         );
    //         throw new VoucherException(
    //           VoucherValidation.PRODUCT_NOT_APPLIED_TO_VOUCHER,
    //         );
    //       }
    //     }
    //     return true;
    //   default:
    //     this.logger.warn(`Invalid voucher type ${voucher.slug}`, context);
    //     throw new VoucherException(VoucherValidation.INVALID_VOUCHER_TYPE);
    // }
  }

  async validateVoucherProductForDeleteOrderItem(
    voucher: Voucher,
    variants: string[],
  ): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateVoucherProductForDeleteOrderItem.name}`;
    const productSlugs: string[] = [];
    for (const variant of variants) {
      const product = await this.productUtils.getProduct({
        where: { variants: { slug: variant } },
      });
      productSlugs.push(product.slug);
    }
    switch (voucher.applicabilityRule) {
      case VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED:
        const voucherProducts = await this.voucherProductRepository.find({
          where: {
            product: {
              slug: In(productSlugs),
            },
            voucher: {
              slug: voucher.slug,
            },
          },
        });

        if (_.size(voucherProducts) < 1) {
          this.logger.warn(
            `Product not applied to voucher ${voucher.slug}`,
            context,
          );
          return false;
        }
        return true;
      case VoucherApplicabilityRule.ALL_REQUIRED:
        for (const productSlug of productSlugs) {
          const voucherProduct = voucher?.voucherProducts.find(
            (voucherProduct) => voucherProduct.product.slug === productSlug,
          );
          if (!voucherProduct) {
            this.logger.warn(
              `Product ${productSlug} not applied to voucher ${voucher.slug}`,
              context,
            );
            return false;
          }
        }
        return true;
      default:
        this.logger.warn(
          `Invalid voucher applicability rule ${voucher.slug}`,
          context,
        );
        return false;
    }
    // switch (voucher.type) {
    //   case VoucherType.SAME_PRICE_PRODUCT:
    //     const voucherProducts = await this.voucherProductRepository.find({
    //       where: {
    //         product: {
    //           slug: In(productSlugs),
    //         },
    //         voucher: {
    //           slug: voucher.slug,
    //         },
    //       },
    //     });

    //     if (_.size(voucherProducts) < 1) {
    //       this.logger.warn(
    //         `Product not applied to voucher ${voucher.slug}`,
    //         context,
    //       );
    //       return false;
    //     }
    //     return true;
    //   case VoucherType.PERCENT_ORDER:
    //   case VoucherType.FIXED_VALUE:
    //     for (const productSlug of productSlugs) {
    //       const voucherProduct = voucher?.voucherProducts.find(
    //         (voucherProduct) => voucherProduct.product.slug === productSlug,
    //       );
    //       if (!voucherProduct) {
    //         this.logger.warn(
    //           `Product ${productSlug} not applied to voucher ${voucher.slug}`,
    //           context,
    //         );
    //         return false;
    //       }
    //     }
    //     return true;
    //   default:
    //     this.logger.warn(`Invalid voucher type ${voucher.slug}`, context);
    //     return false;
    // }
  }

  async validateVoucherProductForCreateOrderItem(
    voucher: Voucher,
    variant: string,
  ): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateVoucherProductForCreateOrderItem.name}`;

    const product = await this.productUtils.getProduct({
      where: { variants: { slug: variant } },
    });
    switch (voucher.applicabilityRule) {
      case VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED:
        return true;
      case VoucherApplicabilityRule.ALL_REQUIRED:
        if (voucher.type === VoucherType.SAME_PRICE_PRODUCT) return true;

        const voucherProduct = await this.voucherProductRepository.findOne({
          where: {
            product: {
              slug: product.slug,
            },
            voucher: {
              slug: voucher.slug,
            },
          },
        });
        if (!voucherProduct) {
          this.logger.warn(
            `Product ${product.slug} not applied to voucher ${voucher.slug}`,
            context,
          );
          return false;
        }
        return true;
      default:
        this.logger.warn(
          `Invalid voucher applicability rule ${voucher.slug}`,
          context,
        );
        return false;
    }
    // switch (voucher.type) {
    //   case VoucherType.SAME_PRICE_PRODUCT:
    //     return true;
    //   case VoucherType.PERCENT_ORDER:
    //   case VoucherType.FIXED_VALUE:
    //     const voucherProduct = await this.voucherProductRepository.findOne({
    //       where: {
    //         product: {
    //           slug: product.slug,
    //         },
    //         voucher: {
    //           slug: voucher.slug,
    //         },
    //       },
    //     });
    //     if (!voucherProduct) {
    //       this.logger.warn(
    //         `Product ${product.slug} not applied to voucher ${voucher.slug}`,
    //         context,
    //       );
    //       return false;
    //     }
    //     return true;
    //   default:
    //     this.logger.warn(`Invalid voucher type ${voucher.slug}`, context);
    //     return false;
    // }
  }

  // validate min order value
  async validateMinOrderValue(
    voucher: Voucher,
    order: Order,
  ): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateMinOrderValue.name}`;
    if (
      voucher.applicabilityRule ===
      VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED
    )
      return true;

    if (voucher.type === VoucherType.SAME_PRICE_PRODUCT) return true;

    const { subtotal } = await this.orderUtils.getOrderSubtotal(order);
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

  async validateMinOrderValueForUpdateOrderItem(
    voucher: Voucher,
    order: Order,
  ): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateMinOrderValue.name}`;
    if (
      voucher.applicabilityRule ===
      VoucherApplicabilityRule.AT_LEAST_ONE_REQUIRED
    )
      return true;

    if (voucher.type === VoucherType.SAME_PRICE_PRODUCT) return true;

    const { subtotal } = await this.orderUtils.getOrderSubtotal(order);
    if (voucher.minOrderValue > subtotal) return false;
    this.logger.log('Validate voucher for update order item success', context);
    return true;
  }

  async validateVoucherPaymentMethod(
    voucher: Voucher,
    paymentMethod: string,
  ): Promise<boolean> {
    const context = `${VoucherUtils.name}.${this.validateVoucherPaymentMethod.name}`;

    if (!voucher) return true;

    const voucherPaymentMethod = voucher.voucherPaymentMethods.find(
      (voucherPaymentMethod) =>
        voucherPaymentMethod.paymentMethod === paymentMethod,
    );

    if (!voucherPaymentMethod) {
      this.logger.warn(
        `Voucher payment method ${paymentMethod} not found`,
        context,
      );
      throw new VoucherException(
        VoucherValidation.VOUCHER_PAYMENT_METHOD_NOT_FOUND,
      );
    }

    return true;
  }
}
