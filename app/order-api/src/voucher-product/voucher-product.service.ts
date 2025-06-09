import { Inject, Injectable, Logger } from '@nestjs/common';
import { VoucherProduct } from './voucher-product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreateVoucherProductRequestDto,
  DeleteVoucherProductRequestDto,
} from './voucher-product.dto';
import { Product } from 'src/product/product.entity';
import { Voucher } from 'src/voucher/voucher.entity';
import _ from 'lodash';
import { ProductException } from 'src/product/product.exception';
import ProductValidation from 'src/product/product.validation';
import { VoucherException } from 'src/voucher/voucher.exception';
import { VoucherValidation } from 'src/voucher/voucher.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { VoucherProductException } from './voucher-product.exception';
import { VoucherProductValidation } from './voucher-product.validation';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class VoucherProductService {
  constructor(
    @InjectRepository(VoucherProduct)
    private readonly voucherProductRepository: Repository<VoucherProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionService: TransactionManagerService,
  ) {}

  async initVoucherProductForExistedVoucherAllProduct() {
    const context = `${VoucherProductService.name}.${this.initVoucherProductForExistedVoucherAllProduct.name}`;
    const batchSize = 500;
    let totalInserted = 0;

    const products = await this.productRepository.find({});

    const vouchers = await this.voucherRepository.find({});

    const voucherProductPairs: VoucherProduct[] = [];
    for (const product of products) {
      for (const voucher of vouchers) {
        const existingVoucherProduct =
          await this.voucherProductRepository.findOne({
            where: {
              voucher: { slug: voucher.slug },
              product: { slug: product.slug },
            },
          });
        if (existingVoucherProduct) {
          continue;
        }
        const voucherProduct = new VoucherProduct();
        voucherProduct.voucher = voucher;
        voucherProduct.product = product;
        voucherProductPairs.push(voucherProduct);

        if (voucherProductPairs.length >= batchSize) {
          await this.transactionService.execute<void>(
            async (manager) => {
              await manager.save(voucherProductPairs);
            },
            () => {
              this.logger.log(
                `Saved ${voucherProductPairs.length} voucher-product pairs`,
                context,
              );
            },
            (error) => {
              this.logger.error(
                `Error updating batch at offset ${voucherProductPairs.length}: ${error.message}`,
                context,
              );
            },
          );

          totalInserted += voucherProductPairs.length;

          voucherProductPairs.length = 0; // clear array
        }
      }
    }

    if (voucherProductPairs.length > 0) {
      await this.transactionService.execute<void>(
        async (manager) => {
          await manager.save(voucherProductPairs);
        },
        () => {
          this.logger.log(
            `Saved ${voucherProductPairs.length} voucher-product pairs`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error updating batch at offset ${voucherProductPairs.length}: ${error.message}`,
            context,
          );
        },
      );
      totalInserted += voucherProductPairs.length;
    }

    this.logger.log(
      `Done. Total inserted: ${totalInserted} voucher-product pairs`,
      context,
    );
  }

  async create(
    createVoucherProductDto: CreateVoucherProductRequestDto,
  ): Promise<number> {
    const context = `${VoucherProductService.name}.${this.create.name}`;
    const products = await this.productRepository.find({
      where: {
        slug: In(createVoucherProductDto.products),
      },
    });
    if (
      _.isEmpty(products) ||
      _.size(products) !== _.size(createVoucherProductDto.products)
    ) {
      this.logger.warn(ProductValidation.PRODUCT_NOT_FOUND.message, context);
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }
    const vouchers = await this.voucherRepository.find({
      where: {
        slug: In(createVoucherProductDto.vouchers),
      },
    });
    if (
      _.isEmpty(vouchers) ||
      _.size(vouchers) !== _.size(createVoucherProductDto.vouchers)
    ) {
      this.logger.warn(VoucherValidation.VOUCHER_NOT_FOUND.message, context);
      throw new VoucherException(VoucherValidation.VOUCHER_NOT_FOUND);
    }
    const voucherProductPairs: VoucherProduct[] = [];
    for (const voucher of vouchers) {
      for (const product of products) {
        const existingVoucherProduct =
          await this.voucherProductRepository.findOne({
            where: {
              voucher: { slug: voucher.slug },
              product: { slug: product.slug },
            },
          });
        if (existingVoucherProduct) {
          this.logger.warn(
            VoucherProductValidation.VOUCHER_PRODUCT_ALREADY_EXISTS.message,
            context,
          );
          throw new VoucherProductException(
            VoucherProductValidation.VOUCHER_PRODUCT_ALREADY_EXISTS,
          );
        }
        const voucherProduct = new VoucherProduct();
        voucherProduct.voucher = voucher;
        voucherProduct.product = product;
        voucherProductPairs.push(voucherProduct);
      }
    }

    const createdVoucherProducts = await this.transactionService.execute<
      VoucherProduct[]
    >(
      async (manager) => {
        const createdVoucherProducts = await manager.save(voucherProductPairs);
        return createdVoucherProducts;
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
    return _.size(createdVoucherProducts);
  }

  async remove(
    deleteVoucherProductDto: DeleteVoucherProductRequestDto,
  ): Promise<number> {
    const context = `${VoucherProductService.name}.${this.remove.name}`;

    const voucherProducts = await this.voucherProductRepository.find({
      where: {
        voucher: { slug: In(deleteVoucherProductDto.vouchers) },
        product: { slug: In(deleteVoucherProductDto.products) },
      },
      relations: ['voucher.orders'],
    });

    for (const voucherProduct of voucherProducts) {
      if (voucherProduct?.voucher?.orders?.length > 0) {
        this.logger.warn(VoucherValidation.VOUCHER_HAS_ORDERS.message, context);
        throw new VoucherException(VoucherValidation.VOUCHER_HAS_ORDERS);
      }
    }

    const deletedVoucherProducts = await this.transactionService.execute<
      VoucherProduct[]
    >(
      async (manager) => await manager.softRemove(voucherProducts),
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
    return _.size(deletedVoucherProducts);
  }
}
