import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductAnalysis } from './product-analysis.entity';
import { Between, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  GetProductAnalysisQueryDto,
  ProductAnalysisQueryDto,
  ProductAnalysisResponseDto,
  RefreshSpecificRangeProductAnalysisQueryDto,
} from './product-analysis.dto';
import { Product } from 'src/product/product.entity';
import { ProductException } from 'src/product/product.exception';
import ProductValidation from 'src/product/product.validation';
import { BranchException } from 'src/branch/branch.exception';
import { BranchValidation } from 'src/branch/branch.validation';
import { Branch } from 'src/branch/branch.entity';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { MenuItem } from 'src/menu-item/menu-item.entity';
import { Menu } from 'src/menu/menu.entity';
import { BranchResponseDto } from 'src/branch/branch.dto';
import moment from 'moment';
import { ProductAnalysisValidation } from './product-analysis.validation';
import { ProductAnalysisException } from './product-analysis.exception';
import { getSpecificProductAnalysisClause } from './product-analysis.clause';
import * as _ from 'lodash';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { ProductAnalysisUtils } from './product-analysis.utils';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductAnalysisService {
  constructor(
    @InjectRepository(ProductAnalysis)
    private readonly productAnalysisRepository: Repository<ProductAnalysis>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly transactionManagerService: TransactionManagerService,
    private readonly productAnalysisUtils: ProductAnalysisUtils,
  ) {}

  async getTopSellProductsByBranch(
    branchSlug: string,
    query: GetProductAnalysisQueryDto,
  ) {
    const branch = await this.branchRepository.findOne({
      where: {
        slug: branchSlug,
      },
    });
    if (!branch) throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);

    const queryBuilder = this.productAnalysisRepository
      .createQueryBuilder('pa')
      .select('pa.product', 'productId')
      .addSelect('pa.branch', 'branchId')
      .addSelect('SUM(pa.totalQuantity)', 'totalProducts')
      .where('pa.branch = :branchId', { branchId: branch.id })
      .groupBy('pa.product')
      .addGroupBy('pa.branch')
      .orderBy('totalProducts', 'DESC');

    if (query.hasPaging)
      queryBuilder.take(query.size).skip((query.page - 1) * query.size);

    const results: ProductAnalysisQueryDto[] = await queryBuilder.getRawMany();

    const productAnalyses: ProductAnalysisResponseDto[] = await Promise.all(
      results.map(async (item) => {
        const product = await this.productRepository.findOne({
          where: {
            id: item.productId,
          },
          relations: ['catalog', 'variants.size'],
        });
        if (!product)
          throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
        const productAnalysis = this.mapper.map(
          item,
          ProductAnalysisQueryDto,
          ProductAnalysis,
        );

        const branch = await this.branchRepository.findOne({
          where: { id: item.branchId },
        });
        if (!branch)
          throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
        productAnalysis.product = product;
        productAnalysis.branch = branch;

        const productAnalysisDto = this.mapper.map(
          productAnalysis,
          ProductAnalysis,
          ProductAnalysisResponseDto,
        );

        const branchesDto = await this.getBranchesListByProduct(product);
        productAnalysisDto.branches = branchesDto;

        return productAnalysisDto;
      }),
    );

    return await this.getPaginatedResults(productAnalyses, query);
  }

  async getTopSellProducts(query: GetProductAnalysisQueryDto) {
    // Get top 10 products that are the best seller in all branch
    const queryBuilder = this.productAnalysisRepository
      .createQueryBuilder('pa')
      .select('pa.product', 'productId')
      .addSelect('SUM(pa.totalQuantity)', 'totalProducts')
      .groupBy('pa.product')
      .orderBy('totalProducts', 'DESC');

    if (query.hasPaging)
      queryBuilder.take(query.size).skip((query.page - 1) * query.size);

    const results: ProductAnalysisQueryDto[] = await queryBuilder.getRawMany();

    const productAnalyses: ProductAnalysisResponseDto[] = await Promise.all(
      results.map(async (item) => {
        const product = await this.productRepository.findOne({
          where: {
            id: item.productId,
          },
          relations: ['catalog', 'variants.size'],
        });
        if (!product)
          throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
        const productAnalysis = this.mapper.map(
          item,
          ProductAnalysisQueryDto,
          ProductAnalysis,
        );
        productAnalysis.product = product;

        const productAnalysisDto = this.mapper.map(
          productAnalysis,
          ProductAnalysis,
          ProductAnalysisResponseDto,
        );
        return productAnalysisDto;
      }),
    );

    return await this.getPaginatedResults(productAnalyses, query);
  }

  private async getPaginatedResults(
    productAnalysesDto: ProductAnalysisResponseDto[],
    query: GetProductAnalysisQueryDto,
  ) {
    const total = productAnalysesDto.length;
    const page = query.hasPaging ? query.page : 1;
    const pageSize = query.hasPaging ? query.size : total;

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);
    // Determine hasNext and hasPrevious
    const hasNext = query.page < totalPages;
    const hasPrevious = query.page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: productAnalysesDto,
      total,
      page,
      pageSize,
      totalPages,
    } as AppPaginatedResponseDto<ProductAnalysisResponseDto>;
  }

  private async getBranchesListByProduct(
    product: Product,
  ): Promise<BranchResponseDto[]> {
    const menuItems = await this.menuItemRepository.find({
      where: {
        product: { id: product.id },
      },
    });

    const currentDate = new Date();
    currentDate.setHours(7, 0, 0, 0);
    const branches: Branch[] = [];
    for (const menuItem of menuItems) {
      const menu = await this.menuRepository.findOne({
        where: {
          menuItems: { id: menuItem.id },
          date: currentDate,
        },
        relations: ['branch'],
      });

      if (menu && menu?.branch) {
        branches.push(menu.branch);
      }
    }
    const branchesDto = this.mapper.mapArray(
      branches,
      Branch,
      BranchResponseDto,
    );

    return branchesDto;
  }

  async refreshProductAnalysisInSpecificTimeRange(
    requestData: RefreshSpecificRangeProductAnalysisQueryDto,
  ) {
    const context = `${ProductAnalysisService.name}.${this.refreshProductAnalysisInSpecificTimeRange.name}`;
    this.denyRefreshProductAnalysisManuallyInTimeAutoRefresh();

    if (requestData.startDate.getTime() > requestData.endDate.getTime()) {
      this.logger.warn(
        ProductAnalysisValidation.START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE
          .message,
        context,
      );
      throw new ProductAnalysisException(
        ProductAnalysisValidation.START_DATE_ONLY_SMALLER_OR_EQUAL_END_DATE,
      );
    }
    this.logger.log(
      `Start refreshing product analysis from ${requestData.startDate} to ${requestData.endDate}`,
      context,
    );
    const startQuery = moment(requestData.startDate).format('YYYY-MM-DD');
    const endQuery = moment(requestData.endDate)
      .add(1, 'days')
      .format('YYYY-MM-DD');

    const startDate = new Date(requestData.startDate);
    startDate.setHours(7, 0, 0, 0);
    const endDate = new Date(requestData.endDate);
    endDate.setHours(7, 0, 0, 0);

    const params = [startQuery, endQuery];
    const results: any[] = await this.productAnalysisRepository.query(
      getSpecificProductAnalysisClause,
      params,
    );
    const productAnalysisQueryDtos = plainToInstance(
      ProductAnalysisQueryDto,
      results,
    );
    // const filledZeroProductAnalysis =
    //   await this.productAnalysisUtils.fillZeroProductAnalysis(
    //     results,
    //     false,
    //     startDate,
    //     endDate,
    //   );

    const groupedProductAnalysisByProduct: ProductAnalysisQueryDto[][] =
      this.productAnalysisUtils.groupProductAnalysisByProduct(
        productAnalysisQueryDtos,
      );

    const updateProducts: Product[] = [];
    const productAnalysesPromise = groupedProductAnalysisByProduct.map(
      async (groupedItem) => {
        const product = await this.productRepository.findOne({
          where: {
            id: _.first(groupedItem).productId,
          },
        });
        if (!product)
          throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
        let newTotalSaleQuantity = product.saleQuantityHistory;
        const oldTotalSaleQuantity = product.saleQuantityHistory;

        const hasProductAnalysesByProduct: ProductAnalysis[] =
          await this.productAnalysisRepository.find({
            where: {
              product: { id: product.id },
              orderDate: Between(startDate, endDate),
            },
            relations: ['branch', 'product'],
          });

        const productAnalysesByProductPromise = groupedItem.map(
          async (item) => {
            const branch = await this.branchRepository.findOne({
              where: { id: item.branchId },
            });
            if (!branch)
              throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);

            const existedProductAnalysis = hasProductAnalysesByProduct.find(
              (hasItem) =>
                hasItem.product.id === item.productId &&
                hasItem.branch.id === item.branchId &&
                moment(item.orderDate).add(7, 'hours').toDate().getTime() ===
                  new Date(hasItem.orderDate).getTime(),
              // add 7 hours because mapper ProductAnalysisQueryDto to ProductAnalysis
            );

            if (existedProductAnalysis) {
              if (existedProductAnalysis.totalQuantity !== item.totalProducts) {
                Object.assign(existedProductAnalysis, {
                  totalQuantity: item.totalProducts,
                });
                newTotalSaleQuantity -= existedProductAnalysis.totalQuantity; // subtract old total quantity
                newTotalSaleQuantity += item.totalProducts; // add new total quantity
                return existedProductAnalysis;
              }
            } else {
              const pa = this.mapper.map(
                item,
                ProductAnalysisQueryDto,
                ProductAnalysis,
              );
              newTotalSaleQuantity += pa.totalQuantity;
              pa.branch = branch;
              pa.product = product;
              return pa;
            }
          },
        );

        const productAnalysesByProduct = await Promise.all(
          productAnalysesByProductPromise,
        );
        if (newTotalSaleQuantity !== oldTotalSaleQuantity) {
          product.saleQuantityHistory = newTotalSaleQuantity;
          updateProducts.push(product);
        }

        return productAnalysesByProduct;
      },
    );

    await this.transactionManagerService.execute<void>(
      async (manager) => {
        const productAnalyses = await Promise.all(productAnalysesPromise);
        let productAnalysesArr: ProductAnalysis[] = _.flatten(productAnalyses);
        productAnalysesArr = productAnalysesArr.filter(Boolean);

        await manager.save(productAnalysesArr);
        // update product
        await manager.save(updateProducts);

        this.logger.log(
          `Product analysis from ${startQuery} to ${endQuery} updated`,
          context,
        );
      },
      () => {
        this.logger.log(`Refresh product analysis success`, context);
      },
      (error) => {
        this.logger.error(
          `Error when refresh product analysis: ${error.message}`,
          error.stack,
          context,
        );
      },
    );
  }

  denyRefreshProductAnalysisManuallyInTimeAutoRefresh() {
    const context = `${ProductAnalysisService.name}.${this.denyRefreshProductAnalysisManuallyInTimeAutoRefresh.name}`;
    const currentMoment = moment();
    const currentHour = currentMoment.hour();

    if (currentHour >= 0 && currentHour <= 2) {
      this.logger.error(
        ProductAnalysisValidation
          .CAN_NOT_REFRESH_PRODUCT_ANALYSIS_MANUALLY_FROM_0H_TO_2H.message,
        null,
        context,
      );
      throw new ProductAnalysisException(
        ProductAnalysisValidation.CAN_NOT_REFRESH_PRODUCT_ANALYSIS_MANUALLY_FROM_0H_TO_2H,
      );
    }
  }
}
