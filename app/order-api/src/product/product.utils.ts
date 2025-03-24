import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Product } from './product.entity';
import ProductValidation from './product.validation';
import { ProductException } from './product.exception';

@Injectable()
export class ProductUtils {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getProduct(options: FindOneOptions<Product>): Promise<Product> {
    const context = `${ProductUtils.name}.${this.getProduct.name}`;

    const product = await this.productRepository.findOne({
      ...options,
    });
    if (!product) {
      this.logger.warn(ProductValidation.PRODUCT_NOT_FOUND.message, context);
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }
    return product;
  }
}
