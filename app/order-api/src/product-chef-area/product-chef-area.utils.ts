import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ProductChefArea } from './product-chef-area.entity';
import ProductChefAreaValidation from './product-chef-area.validation';
import { ProductChefAreaException } from './product-chef-area.exception';

@Injectable()
export class ProductChefAreaUtils {
  constructor(
    @InjectRepository(ProductChefArea)
    private readonly productChefAreaRepository: Repository<ProductChefArea>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getProductChefArea(
    options: FindOneOptions<ProductChefArea>,
  ): Promise<ProductChefArea> {
    const context = `${ProductChefAreaUtils.name}.${this.getProductChefArea.name}`;

    const productChefArea = await this.productChefAreaRepository.findOne({
      ...options,
    });
    if (!productChefArea) {
      this.logger.warn(
        ProductChefAreaValidation.PRODUCT_CHEF_AREA_NOT_FOUND.message,
        context,
      );
      throw new ProductChefAreaException(
        ProductChefAreaValidation.PRODUCT_CHEF_AREA_NOT_FOUND,
      );
    }

    return productChefArea;
  }
}
