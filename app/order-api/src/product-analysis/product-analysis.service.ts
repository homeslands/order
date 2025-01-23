import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductAnalysis } from './product-analysis.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import {
  GetProductAnalysisQueryDto,
  ProductAnalysisQueryDto,
  ProductAnalysisResponseDto,
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

        const productAnalysisDto = this.mapper.map(productAnalysis, ProductAnalysis, ProductAnalysisResponseDto);

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
    product: Product
  ): Promise<BranchResponseDto[]> {
    const menuItems = await this.menuItemRepository.find({
      where: {
        product: { id: product.id },
      }
    });

    const currentDate = new Date();
    currentDate.setHours(7,0,0,0);
    const branches: Branch[] = [];
    for(const menuItem of menuItems) {
      const menu = await this.menuRepository.findOne({
        where: {
          menuItems: { id: menuItem.id },
          date: currentDate
        }, 
        relations: ['branch']
      });

      if(menu && menu?.branch) {
        branches.push(menu.branch);
      }
    }
    const branchesDto = this.mapper.mapArray(branches, Branch, BranchResponseDto);

    return branchesDto;
  }
}
