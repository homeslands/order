import { Inject, Injectable, Logger } from '@nestjs/common';
import { VoucherProduct } from './voucher-product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { VoucherProductValidation } from './voucher-product.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { VoucherProductException } from './voucher-product.exception';

@Injectable()
export class VoucherProductUtils {
  constructor(
    @InjectRepository(VoucherProduct)
    private readonly voucherProductRepository: Repository<VoucherProduct>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async getVoucherProduct(
    options: FindOneOptions<VoucherProduct>,
  ): Promise<VoucherProduct> {
    const context = `${VoucherProductUtils.name}.${this.getVoucherProduct.name}`;
    try {
      const voucherProduct = await this.voucherProductRepository.findOne({
        ...options,
      });
      if (!voucherProduct) {
        this.logger.warn(`Voucher not found`, context);
        throw new VoucherProductException(
          VoucherProductValidation.VOUCHER_PRODUCT_NOT_FOUND,
        );
      }
      return voucherProduct;
    } catch (error) {
      this.logger.error(error.message, error.stack, context);
      throw new VoucherProductException(
        VoucherProductValidation.FIND_ONE_VOUCHER_PRODUCT_FAILED,
        error.message,
      );
    }
  }
}
