import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Variant } from './variant.entity';
import { VariantException } from './variant.exception';
import { VariantValidation } from './variant.validation';

@Injectable()
export class VariantUtils {
  constructor(
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
  ) {}

  async getVariant(options: FindOneOptions<Variant>): Promise<Variant> {
    const variant = await this.variantRepository.findOne({
      relations: ['product', 'size'],
      ...options,
    });
    if (!variant)
      throw new VariantException(VariantValidation.VARIANT_NOT_FOUND);
    return variant;
  }
}
