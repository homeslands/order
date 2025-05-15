import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ProductAnalysis } from './product-analysis.entity';
import { ProductAnalysisQueryDto } from './product-analysis.dto';
import { Branch } from 'src/branch/branch.entity';
import { Product } from 'src/product/product.entity';

@Injectable()
export class ProductAnalysisUtils {
  constructor(
    @InjectRepository(ProductAnalysis)
    private readonly productAnalysisRepository: Repository<ProductAnalysis>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  groupProductAnalysisByProduct(
    requestData: ProductAnalysisQueryDto[],
  ): ProductAnalysisQueryDto[][] {
    return Object.values(
      requestData.reduce((acc, item) => {
        if (!acc[item.productId]) {
          acc[item.productId] = [];
        }
        acc[item.productId].push(item);
        return acc;
      }, {}),
    );
  }

  async fillZeroProductAnalysis(
    salesData: ProductAnalysisQueryDto[],
    isInit: true,
  ): Promise<ProductAnalysisQueryDto[]>;

  async fillZeroProductAnalysis(
    salesData: ProductAnalysisQueryDto[],
    isInit: false,
    startDate: Date,
    endDate: Date,
  ): Promise<ProductAnalysisQueryDto[]>;

  async fillZeroProductAnalysis(
    salesData: ProductAnalysisQueryDto[],
    isInit: boolean,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProductAnalysisQueryDto[]> {
    const branches = await this.branchRepository.find();
    const products = await this.productRepository.find();

    let results: ProductAnalysisQueryDto[] = [];
    if (isInit) {
      for (const branch of branches) {
        const filedResult = await this.fillZeroProductAnalysisByBranch(
          branch,
          salesData,
          products,
          true,
        );
        results = results.concat(filedResult);
      }
    } else {
      for (const branch of branches) {
        const filedResult = await this.fillZeroProductAnalysisByBranch(
          branch,
          salesData,
          products,
          false,
          startDate,
          endDate,
        );
        results = results.concat(filedResult);
      }
    }
    return results;
  }

  async fillZeroProductAnalysisByBranch(
    branch: Branch,
    queryData: ProductAnalysisQueryDto[],
    products: Product[],
    isInit: true,
  ): Promise<ProductAnalysisQueryDto[]>;

  async fillZeroProductAnalysisByBranch(
    branch: Branch,
    queryData: ProductAnalysisQueryDto[],
    products: Product[],
    isInit: false,
    startDate: Date,
    endDate: Date,
  ): Promise<ProductAnalysisQueryDto[]>;

  async fillZeroProductAnalysisByBranch(
    branch: Branch,
    queryData: ProductAnalysisQueryDto[],
    products: Product[],
    isInit: boolean,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProductAnalysisQueryDto[]> {
    if (isInit) {
      endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
    }
    endDate.setHours(0, 0, 0, 0);

    let results: ProductAnalysisQueryDto[] = [];
    products.forEach((product) => {
      if (isInit) {
        startDate = new Date(branch.createdAt);
        if (
          new Date(product.createdAt).getTime() >
          new Date(branch.createdAt).getTime()
        ) {
          startDate = new Date(product.createdAt);
        }
      } else {
        if (startDate.getTime() < new Date(product.createdAt).getTime()) {
          startDate = new Date(product.createdAt);
        }
        if (startDate.getTime() < new Date(branch.createdAt).getTime()) {
          startDate = new Date(branch.createdAt);
        }
      }
      startDate.setHours(0, 0, 0, 0);

      const datesInRange: Date[] = [];

      while (startDate <= endDate) {
        datesInRange.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + 1);
      }
      const fullData: ProductAnalysisQueryDto[] = [];
      datesInRange.forEach((date) => {
        const matchingElement = queryData.find(
          (item) =>
            new Date(item.orderDate).getTime() === new Date(date).getTime() &&
            item.productId === product.id &&
            item.branchId === branch.id,
        );
        if (matchingElement) {
          fullData.push(matchingElement);
        } else {
          fullData.push({
            branchId: branch.id,
            orderDate: date,
            productId: product.id,
            totalProducts: 0,
          });
        }
      });

      // console.log({ fullData });
      results = results.concat(fullData);
    });
    return results;
  }
}
