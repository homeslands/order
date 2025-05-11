import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VoucherGroup } from './voucher-group.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { VoucherGroupValidation } from './voucher-group.validation';
import { VoucherGroupException } from './voucher-group.exception';

@Injectable()
export class VoucherGroupUtils {
  constructor(
    @InjectRepository(VoucherGroup)
    private readonly voucherGroupRepository: Repository<VoucherGroup>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async getVoucherGroup(
    options: FindOneOptions<VoucherGroup>,
  ): Promise<VoucherGroup> {
    const context = `${VoucherGroupUtils.name}.${this.getVoucherGroup.name}`;
    const voucherGroup = await this.voucherGroupRepository.findOne({
      ...options,
    });
    if (!voucherGroup) {
      this.logger.warn('Voucher group not found', context);
      throw new VoucherGroupException(
        VoucherGroupValidation.VOUCHER_GROUP_NOT_FOUND,
      );
    }
    return voucherGroup;
  }
}
