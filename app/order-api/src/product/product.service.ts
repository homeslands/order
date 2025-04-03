import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Product } from './product.entity';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateProductRequestDto,
  GetProductRequestDto,
  ProductResponseDto,
  UpdateProductRequestDto,
  ValidationError,
} from './product.dto';
import { Variant } from 'src/variant/variant.entity';
import { Catalog } from 'src/catalog/catalog.entity';
import { FileService } from 'src/file/file.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ProductException } from './product.exception';
import ProductValidation from './product.validation';
import { CatalogException } from 'src/catalog/catalog.exception';
import { CatalogValidation } from 'src/catalog/catalog.validation';
import { Workbook, Worksheet } from 'exceljs';
import * as _ from 'lodash';
import * as reader from 'xlsx';
import { Size } from 'src/size/size.entity';
import FileValidation from 'src/file/file.validation';
import { FileException } from 'src/file/file.exception';
import { PromotionUtils } from 'src/promotion/promotion.utils';
import { MenuUtils } from 'src/menu/menu.utils';
import { BranchUtils } from 'src/branch/branch.utils';
import { AppPaginatedResponseDto } from 'src/app/app.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    @InjectRepository(Catalog)
    private readonly catalogRepository: Repository<Catalog>,
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly fileService: FileService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private readonly promotionUtils: PromotionUtils,
    private readonly menuUtils: MenuUtils,
    private readonly branchUtils: BranchUtils,
  ) {}

  /**
   * Get product by slug
   * @param {string} slug The product slug is retrieved
   * @returns {Promise<ProductResponseDto>} The product data is retrieved
   * @throws {ProductException} if product not found
   */
  async getProduct(slug: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['catalog', 'variants.size'],
    });
    if (!product) {
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }
    return this.mapper.map(product, Product, ProductResponseDto);
  }

  /**
   * Upload product image
   * @param {string} slug The product slug is uploaded image
   * @param {Express.Multer.File} file The image file is uploaded
   * @returns {Promise<ProductResponseDto>} The product data after uploaded image
   * @throws {ProductException} if product is not found
   */
  async uploadProductImage(
    slug: string,
    file: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const context = `${ProductService.name}.${this.uploadProductImage.name}`;
    const product = await this.productRepository.findOne({
      where: {
        slug,
      },
    });
    if (!product) {
      this.logger.error(
        ProductValidation.PRODUCT_NOT_FOUND.message,
        null,
        context,
      );
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }

    // Remove old image
    this.fileService.removeFile(product.image);

    const image = await this.fileService.uploadFile(file);
    product.image = `${image.name}`;
    const updatedProduct = await this.productRepository.save(product);

    this.logger.log(
      `Product image ${image.name} uploaded successfully`,
      context,
    );

    return this.mapper.map(updatedProduct, Product, ProductResponseDto);
  }

  async deleteProductImage(slug: string, name: string): Promise<number> {
    const context = `${ProductService.name}.${this.deleteProductImage.name}`;
    const product = await this.productRepository.findOne({
      where: {
        slug,
      },
    });
    if (!product) {
      this.logger.error(
        ProductValidation.PRODUCT_NOT_FOUND.message,
        null,
        context,
      );
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }

    // Remove old image
    this.fileService.removeFile(name);

    const oldImages = JSON.parse(product.images);
    const newImages = oldImages.filter((item) => item !== name);
    product.images = JSON.stringify(newImages);
    await this.productRepository.save(product);
    return 1;
  }

  async uploadMultiProductImages(
    slug: string,
    files: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    const context = `${ProductService.name}.${this.uploadMultiProductImages.name}`;
    const product = await this.productRepository.findOne({
      where: {
        slug,
      },
    });
    if (!product) {
      this.logger.error(
        ProductValidation.PRODUCT_NOT_FOUND.message,
        null,
        context,
      );
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);
    }

    const handleNameFiles = this.fileService.handleDuplicateFilesName(files);
    const imagesUpload = await this.fileService.uploadFiles(handleNameFiles);
    const nameImagesUpload = imagesUpload.map((item) => item.name);

    let images: string[] = [];
    if (product.images) {
      images = JSON.parse(product.images);
    }
    images = images.concat(nameImagesUpload);
    product.images = JSON.stringify(images);

    const updatedProduct = await this.productRepository.save(product);

    this.logger.log(`Product images uploaded successfully`, context);

    return this.mapper.map(updatedProduct, Product, ProductResponseDto);
  }

  /**
   * Create a new product
   * @param {CreateProductRequestDto} createProductDto The data to create product
   * @returns {Promise<ProductResponseDto>} The created product
   * @throws {ProductException} if the product name already exists
   * @throws {CatalogException} if the catalog with specified slug is not found
   */
  async createProduct(
    createProductDto: CreateProductRequestDto,
  ): Promise<ProductResponseDto> {
    const context = `${ProductService.name}.${this.createProduct.name}`;
    const product = await this.productRepository.findOneBy({
      name: createProductDto.name,
    });

    if (product) {
      this.logger.error(
        ProductValidation.PRODUCT_NAME_EXIST.message,
        null,
        context,
      );
      throw new ProductException(ProductValidation.PRODUCT_NAME_EXIST);
    }

    const catalog = await this.catalogRepository.findOneBy({
      slug: createProductDto.catalog,
    });
    if (!catalog)
      throw new CatalogException(CatalogValidation.CATALOG_NOT_FOUND);

    const productData = this.mapper.map(
      createProductDto,
      CreateProductRequestDto,
      Product,
    );
    Object.assign(productData, { catalog });

    const newProduct = this.productRepository.create(productData);
    const createdProduct = await this.productRepository.save(newProduct);
    this.logger.log(
      `Product ${createdProduct.name} created successfully`,
      context,
    );

    const productDto = this.mapper.map(
      createdProduct,
      Product,
      ProductResponseDto,
    );
    return productDto;
  }

  /**
   * Get all products or get products by catalog
   * @param {GetProductRequestDto} query The catalog slug if get product by catalog
   * @returns {Promise<ProductResponseDto[]>} The products array is retrieved
   */
  async getAllProducts(
    query: GetProductRequestDto,
  ): Promise<ProductResponseDto[]> {
    let products = await this.productRepository.find({
      where: {
        catalog: {
          slug: query.catalog,
        },
        isTopSell: query.isTopSell,
        isNew: query.isNew,
      },
      relations: ['catalog', 'variants.size'],
    });

    if (query.promotion) {
      const promotion = await this.promotionUtils.getPromotion({
        where: {
          slug: query.promotion,
        },
      });
      const applicableProductIds = promotion.applicablePromotions.map(
        (item) => item.applicableId,
      );
      products = products.filter((item) =>
        query.isAppliedPromotion
          ? applicableProductIds.includes(item.id)
          : !applicableProductIds.includes(item.id),
      );
    }

    if (query.branch) {
      const branch = await this.branchUtils.getBranch({
        where: { slug: query.branch },
        relations: ['chefAreas.productChefAreas.product'],
      });

      const branchProductIds = branch.chefAreas.map((chefArea) => {
        const chefAreaProducts = chefArea.productChefAreas.map(
          (productChefArea) => productChefArea.product.id,
        );
        return chefAreaProducts;
      });
      const productIds = _.flatten(branchProductIds);

      products = products.filter((item) =>
        query.isAppliedBranchForChefArea
          ? productIds.includes(item.id)
          : !productIds.includes(item.id),
      );
    }

    if (query.menu) {
      const menu = await this.menuUtils.getMenu({
        where: {
          slug: query.menu ?? IsNull(),
        },
      });

      const productIdsInMenu = menu.menuItems.map((item) => item.product.id);
      products = products.filter((item) =>
        query.inMenu
          ? productIdsInMenu.includes(item.id)
          : !productIdsInMenu.includes(item.id),
      );
    }

    const productsDto = this.mapper.mapArray(
      products,
      Product,
      ProductResponseDto,
    );

    return productsDto;
  }

  async getAllProductsPagination(
    query: GetProductRequestDto,
  ): Promise<AppPaginatedResponseDto<ProductResponseDto>> {
    const findOptionsWhere: FindOptionsWhere<Product> = {
      catalog: {
        slug: query.catalog,
      },
      isTopSell: query.isTopSell,
      isNew: query.isNew,
    };

    if (query.promotion) {
      const promotion = await this.promotionUtils.getPromotion({
        where: { slug: query.promotion },
      });
      const applicableProductIds = promotion.applicablePromotions.map(
        (item) => item.applicableId,
      );
      findOptionsWhere.id = query.isAppliedPromotion
        ? In(applicableProductIds)
        : Not(In(applicableProductIds));
    }

    if (query.branch) {
      const branch = await this.branchUtils.getBranch({
        where: { slug: query.branch },
        relations: ['chefAreas.productChefAreas.product'],
      });

      const branchProductIds = branch.chefAreas.flatMap((chefArea) =>
        chefArea.productChefAreas.map(
          (productChefArea) => productChefArea.product.id,
        ),
      );

      findOptionsWhere.id = query.isAppliedBranchForChefArea
        ? In(branchProductIds)
        : Not(In(branchProductIds));
    }

    if (query.menu) {
      const menu = await this.menuUtils.getMenu({
        where: { slug: query.menu ?? IsNull() },
      });
      const productIdsInMenu = menu.menuItems.map((item) => item.product.id);
      findOptionsWhere.id = query.inMenu
        ? In(productIdsInMenu)
        : Not(In(productIdsInMenu));
    }

    const findManyOptions: FindManyOptions<Product> = {
      where: findOptionsWhere,
      relations: ['catalog', 'variants.size'],
      order: { createdAt: 'DESC' },
    };

    if (query.hasPaging) {
      Object.assign(findManyOptions, {
        skip: (query.page - 1) * query.size,
        take: query.size,
      });
    }

    const [products, total] =
      await this.productRepository.findAndCount(findManyOptions);
    const totalPages = Math.ceil(total / query.size);
    const hasNext = query.page < totalPages;
    const hasPrevious = query.page > 1;

    const productsDto = this.mapper.mapArray(
      products,
      Product,
      ProductResponseDto,
    );

    return {
      hasNext,
      hasPrevios: hasPrevious,
      items: productsDto,
      total,
      page: query.hasPaging ? query.page : 1,
      pageSize: query.hasPaging ? query.size : total,
      totalPages,
    } as AppPaginatedResponseDto<ProductResponseDto>;
  }

  /**
   * Update the product information
   * @param {string} slug The product slug is updated
   * @param {UpdateProductRequestDto} requestData The data to update product
   * @returns {Promise<ProductResponseDto>} The product data after updated
   * @throws {ProductException} if product that need updating is not found
   * @throws {ProductException} if catalog update for product is not found
   */
  async updateProduct(
    slug: string,
    requestData: UpdateProductRequestDto,
  ): Promise<ProductResponseDto> {
    const context = `${ProductService.name}.${this.updateProduct.name}`;
    const product = await this.productRepository.findOneBy({ slug });
    if (!product)
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);

    const existProductName = await this.productRepository.findOneBy({
      name: requestData.name,
    });
    if (existProductName) {
      this.logger.warn(ProductValidation.PRODUCT_NAME_EXIST.message, context);
      throw new ProductException(ProductValidation.PRODUCT_NAME_EXIST);
    }

    // limit product -> update current, template menu item
    if (product.isLimit !== requestData.isLimit) {
      if (requestData.isLimit) {
        if (!requestData.defaultQuantity) {
          this.logger.warn(
            ProductValidation.DEFAULT_QUANTITY_REQUIRED.message,
            context,
          );
          throw new ProductException(
            ProductValidation.DEFAULT_QUANTITY_REQUIRED,
          );
        }
        // need specific default stock
        // update current menu item + template menu item
      } else {
        // update current menu item + template menu item: infinity
        // function: params: product, quantity, branch, date
      }
    }

    const catalog = await this.catalogRepository.findOneBy({
      slug: requestData.catalog,
    });
    if (!catalog)
      throw new CatalogException(CatalogValidation.CATALOG_NOT_FOUND);

    const productData = this.mapper.map(
      requestData,
      UpdateProductRequestDto,
      Product,
    );

    Object.assign(product, { ...productData, catalog });
    const updatedProduct = await this.productRepository.save(product);
    this.logger.log(
      `Product ${updatedProduct.name} updated successfully`,
      context,
    );

    // product = await this.productRepository.findOneBy({ slug });

    const productDto = this.mapper.map(
      updatedProduct,
      Product,
      ProductResponseDto,
    );
    return productDto;
  }

  /**
   * Delete product by slug
   * @param {string} slug The slug of product is deleted
   * @returns {Promise<number>} The number of product records is deleted
   * @throws {ProductException} if product is not found
   */
  async deleteProduct(slug: string): Promise<number> {
    const context = `${ProductService.name}.${this.deleteProduct.name}`;
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['variants'],
    });
    if (!product)
      throw new ProductException(ProductValidation.PRODUCT_NOT_FOUND);

    // Delete variants
    await this.deleteVariantsRelatedProduct(product.variants);
    const deleted = await this.productRepository.softDelete({ slug });
    this.logger.log(`Product ${slug} deleted successfully`, context);

    return deleted.affected || 0;
  }

  /**
   * Deleted list variants is related to product
   * @param {Variant[]} variants The array of variants is deleted
   */
  async deleteVariantsRelatedProduct(variants: Variant[]): Promise<void> {
    if (variants.length < 1) return;

    const variantSlugs = variants.map((item) => item.slug);
    await this.variantRepository.softDelete({
      slug: In(variantSlugs),
    });
  }

  async createManyProducts(file?: Express.Multer.File) {
    const context = `${ProductService.name}.${this.createManyProducts.name}`;
    const workbook = new Workbook();
    if (!file?.buffer) throw new BadRequestException('File not found');

    await workbook.xlsx.load(file.buffer);

    if (_.isEmpty(workbook.worksheets))
      throw new BadRequestException('File not any sheets');

    const worksheet = workbook.getWorksheet(1);

    const validationData = await this.validateDataFromExcel(worksheet);
    if (!_.isEmpty(validationData.errors)) {
      const formattedErrors = this.convertErrorsToExcelFormat(
        validationData.errors,
      );
      const ws = reader.utils.json_to_sheet(formattedErrors);
      const validationWorkbook = reader.utils.book_new();
      reader.utils.book_append_sheet(
        validationWorkbook,
        ws,
        'ValidationErrors',
      );

      const excelBuffer = reader.write(validationWorkbook, {
        type: 'buffer',
        bookType: 'xlsx',
      });

      return { errors: true, excelBuffer };
    }

    const normalizedData = this.dataStandardization(validationData.data);
    // check duplicate product name
    const duplicateNames = normalizedData
      .map((item) => item[1])
      .filter((name, index, array) => array.indexOf(name) !== index);

    if (duplicateNames.length > 0) {
      this.logger.warn(
        ProductValidation.DUPLICATE_PRODUCT_NAME.message,
        context,
      );
      throw new ProductException(
        ProductValidation.DUPLICATE_PRODUCT_NAME,
        `Duplicate product names: ${duplicateNames.join(', ')}`,
      );
    }

    const createdCatalogsAndSizes =
      await this.getListCreatedCatalogsAndSizes(normalizedData);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // code
      const createdCatalogs = await queryRunner.manager.save(
        createdCatalogsAndSizes.setCreatedCatalogs,
      );

      const createdSizes = await queryRunner.manager.save(
        createdCatalogsAndSizes.setCreatedSizes,
      );

      for (const productData of normalizedData) {
        const existProductName = await this.productRepository.findOneBy({
          name: productData[1],
        });
        if (existProductName) {
          this.logger.warn(
            ProductValidation.PRODUCT_NAME_EXIST.message,
            context,
          );
          throw new ProductException(ProductValidation.PRODUCT_NAME_EXIST);
        }

        let catalog = await this.catalogRepository.findOneBy({
          name: productData[2],
        });
        if (!catalog) {
          catalog = createdCatalogs.find(
            (item) => item.name === productData[2],
          );
        }
        const newProduct = new Product();
        Object.assign(newProduct, {
          name: productData[1],
          description: productData[3],
          catalog,
          isTopSell: productData[5] ?? false,
          isNew: productData[4] ?? false,
        });

        const createdProduct = await queryRunner.manager.save(newProduct);

        const newVariants: Variant[] = [];
        if (productData[6]) {
          let size = await this.sizeRepository.findOneBy({
            name: productData[6],
          });
          if (!size) {
            size = createdSizes.find((item) => item.name === productData[6]);
          }
          const newVariant = new Variant();
          Object.assign(newVariant, {
            product: createdProduct,
            size,
            price: productData[7],
          });
          newVariants.push(newVariant);
        }

        if (productData[8]) {
          let size = await this.sizeRepository.findOneBy({
            name: productData[8],
          });
          if (!size) {
            size = createdSizes.find((item) => item.name === productData[8]);
          }
          const newVariant = new Variant();
          Object.assign(newVariant, {
            product: createdProduct,
            size,
            price: productData[9],
          });
          newVariants.push(newVariant);
        }

        if (productData[10]) {
          let size = await this.sizeRepository.findOneBy({
            name: productData[10],
          });
          if (!size) {
            size = createdSizes.find((item) => item.name === productData[10]);
          }
          const newVariant = new Variant();
          Object.assign(newVariant, {
            product: createdProduct,
            size,
            price: productData[11],
          });
          newVariants.push(newVariant);
        }

        await queryRunner.manager.save(newVariants);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Created ${normalizedData.length} successfully`);
      return { errors: false, countCreated: normalizedData.length };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // product exception
      if (error instanceof ProductException) {
        this.logger.warn(error.message, context);
        throw error;
      }

      // other error
      this.logger.warn(
        ProductValidation.CREATE_MANY_PRODUCTS_FAILED.message,
        context,
      );
      throw new ProductException(ProductValidation.CREATE_MANY_PRODUCTS_FAILED);
    } finally {
      await queryRunner.release();
    }
  }

  async validateDataFromExcel(worksheet: Worksheet) {
    const context = `${ProductService.name}.${this.validateDataFromExcel.name}`;

    const validateDataType = {
      2: 'string', // Tên sản phẩm
      3: 'string', // Nhóm hàng
      4: 'string', // Mô tả
      5: 'boolean', // Là sản phẩm mới
      6: 'boolean', // Là sản phẩm bán chạy
      7: 'string', // Hình ảnh chín (url)
      8: 'string', // Hình ảnh thêm (url1, url2, ...)
      9: 'string', // Kích thước 1
      10: 'number', // Giá kích thước 1
      11: 'string', // Kích thước 2
      12: 'number', // Giá kích thước 2
      13: 'string', // Kích thước 3
      14: 'number', // Giá kích thước 3
    };

    const headerRowValidation = [
      undefined,
      'Stt',
      'Tên sản phẩm',
      'Nhóm hàng (Đồ ăn, nước uống,…)',
      'Mô tả',
      'Là sản phẩm mới',
      'Là sản phẩm bán chạy',
      'Hình ảnh chín (url)',
      'Hình ảnh thêm (url1, url2, …)',
      'Kích thước 1',
      'Giá kích thước 1',
      'Kích thước 2',
      'Giá kích thước 2',
      'Kích thước 3',
      'Giá kích thước 3',
    ];

    const requiredColumns = [2, 3];

    const errors = [];
    // [string, string, string, boolean, boolean, string, string, string, number, string, number, string, number]
    const data = [];
    const headerRow = worksheet.getRow(1);

    const headerRowValues = headerRow.values;

    if (
      JSON.stringify(headerRowValidation) !== JSON.stringify(headerRowValues)
    ) {
      this.logger.warn(FileValidation.EXCEL_FILE_WRONG_HEADER.message, context);
      throw new FileException(FileValidation.EXCEL_FILE_WRONG_HEADER);
    }

    const rows = worksheet.getRows(2, worksheet.rowCount) || [];
    for (const row of rows) {
      if (row.number > 1) {
        if (!(row.values && Array.isArray(row.values))) {
          break;
        }
        if (_.isEmpty(row.values)) break;

        const rowLength = row.values.length;
        // let rowErrors: { [key: string]: string } = {};
        const rowErrors: { [key: string]: string[] } = {};
        for (let colNumber = 1; colNumber <= rowLength; colNumber++) {
          const expectedType = validateDataType[colNumber];
          const value = row.values[colNumber];
          const isRequired = requiredColumns.includes(colNumber);

          if (colNumber === 2) {
            const existProductName = await this.productRepository.findOneBy({
              name: value.toString(),
            });
            if (existProductName) {
              rowErrors[colNumber] = rowErrors[colNumber] || [];
              rowErrors[colNumber].push(`Tên sản phẩm "${value}" đã tồn tại.`);
            }
          }

          if (isRequired) {
            if (
              !value ||
              value === null ||
              value === undefined ||
              (typeof value === 'string' && value.trim() === '')
            ) {
              // rowErrors.value = `${headerRowValues[colNumber]} là cột bắt buộc và không thể trống.`;
              rowErrors[colNumber] = rowErrors[colNumber] || [];
              rowErrors[colNumber].push(
                `${headerRowValues[colNumber]} là cột bắt buộc và không thể trống.`,
              );
            } else {
              const actualType = typeof value;

              if (expectedType && actualType !== expectedType) {
                // rowErrors.value = `Giá trị "${value}" không thỏa mãn kiểu dữ liệu cho cột ${headerRowValues[colNumber]}. Mong đợi kiểu ${expectedType}, nhưng nhận được ${actualType}.`;
                rowErrors[colNumber] = rowErrors[colNumber] || [];
                rowErrors[colNumber].push(
                  `Giá trị "${value}" không thỏa mãn kiểu dữ liệu cho cột ${headerRowValues[colNumber]}. Mong đợi kiểu ${expectedType}, nhưng nhận được ${actualType}.`,
                );
              }
            }
          } else {
            if (
              (value !== null && value !== undefined) ||
              (typeof value === 'string' && value.trim() === '')
            ) {
              const actualType = typeof value;
              if (expectedType && actualType !== expectedType) {
                // rowErrors.value = `Giá trị "${value}" không thỏa mãn kiểu dữ liệu cho cột ${headerRowValues[colNumber]}. Mong đợi kiểu ${expectedType}, nhưng nhận được ${actualType}.`;
                rowErrors[colNumber] = rowErrors[colNumber] || [];
                rowErrors[colNumber].push(
                  `Giá trị "${value}" không thỏa mãn kiểu dữ liệu cho cột ${headerRowValues[colNumber]}. Mong đợi kiểu ${expectedType}, nhưng nhận được ${actualType}.`,
                );
              }
            }
          }
        }
        if (Object.keys(rowErrors).length > 0) {
          errors.push({ row: row.number, errors: rowErrors });
        }
        data.push(row.values.slice(1));
      }
    }
    // worksheet.eachRow(async (row, rowNumber) => {

    // });

    return {
      errors,
      data,
    };
  }

  dataStandardization(data: any[][]) {
    const result = [];
    data.forEach((rowData) => {
      const normalizedRowData = rowData;
      rowData.forEach((itemData, index) => {
        if (index === 2) {
          normalizedRowData[2] = itemData.toLocaleLowerCase();
        }
        if (index === 8) {
          normalizedRowData[8] = itemData.toLocaleLowerCase();
        }
        if (index === 10) {
          normalizedRowData[10] = itemData.toLocaleLowerCase();
        }
        if (index === 12) {
          normalizedRowData[12] = itemData.toLocaleLowerCase();
        }
      });

      result.push(normalizedRowData);
    });
    return result;
  }

  async getListCreatedCatalogsAndSizes(data: any[][]) {
    const setCatalogs = new Set<string>();
    const setCreatedCatalogs: Catalog[] = []; // need create new
    const setSizes = new Set<string>();
    const setCreatedSizes: Size[] = []; // need create new
    data.forEach((rowData) => {
      rowData.forEach((itemData, index) => {
        if (index === 2) {
          setCatalogs.add(itemData);
        }
        if (index === 8) {
          setSizes.add(itemData);
        }
        if (index === 10) {
          setSizes.add(itemData);
        }
        if (index === 12) {
          setSizes.add(itemData);
        }
      });
    });

    for (const catalog of setCatalogs) {
      const queryCatalog = await this.catalogRepository.findOneBy({
        name: catalog,
      });

      if (!queryCatalog) {
        const newCatalog = new Catalog();
        Object.assign(newCatalog, { name: catalog });
        setCreatedCatalogs.push(newCatalog);
      }
    }
    for (const size of setSizes) {
      const querySize = await this.sizeRepository.findOneBy({
        name: size,
      });
      if (!querySize) {
        const newSize = new Size();
        Object.assign(newSize, { name: size });
        setCreatedSizes.push(newSize);
      }
    }

    return {
      setCreatedSizes,
      setCreatedCatalogs,
    };
  }

  convertErrorsToExcelFormat(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      row: error.row,
      errors: Object.entries(error.errors)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; '),
    }));
  }

  async exportAllProducts() {
    const products = await this.productRepository.find({
      relations: ['catalog', 'variants.size'],
    });
    const cellData: {
      cellPosition: string;
      value: string;
      type: string;
    }[] = [];

    let rowIndex = 3; // Starting row for products
    products.forEach((item, index) => {
      cellData.push(
        {
          cellPosition: `A${rowIndex}`,
          value: (index + 1).toString(),
          type: 'data',
        },
        {
          cellPosition: `B${rowIndex}`,
          value: item.name || 'N/A',
          type: 'data',
        },
        {
          cellPosition: `C${rowIndex}`,
          value: item.catalog?.name || 'N/A',
          type: 'data',
        },
        {
          cellPosition: `D${rowIndex}`,
          value: item.isLimit ? 'x' : '',
          type: 'data',
        },
        {
          cellPosition: `E${rowIndex}`,
          value: item.description || 'N/A',
          type: 'data',
        },
      );

      let uniCodeNameColumn = 70;
      item.variants?.forEach((variant) => {
        cellData.push(
          {
            cellPosition: `${String.fromCharCode(uniCodeNameColumn)}${rowIndex}`,
            value: variant.size?.name || 'N/A',
            type: 'data',
          },
          {
            cellPosition: `${String.fromCharCode(uniCodeNameColumn + 1)}${rowIndex}`,
            value: variant.price.toString() || 'N/A',
            type: 'data',
          },
        );

        uniCodeNameColumn += 2;
      });

      rowIndex++;
    });

    return this.fileService.generateExcelFile({
      filename: 'export-products.xlsx',
      cellData,
    });
  }

  async getTemplateImportProducts() {
    return this.fileService.getTemplateExcel('import-products.xlsx');
  }
}
