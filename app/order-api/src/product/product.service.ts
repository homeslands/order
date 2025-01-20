import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { Product } from './product.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateProductRequestDto,
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
import { name } from 'ejs';

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
    
  ) {}

  async getPopularProducts() {}

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
    console.log({ product });
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
   * @param {string} catalog The catalog slug if get product by catalog
   * @returns {Promise<ProductResponseDto[]>} The products array is retrieved
   */
  async getAllProducts(catalog?: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.find({
      where: {
        catalog: {
          slug: catalog,
        },
      },
      relations: ['catalog', 'variants.size'],
    });
    const productsDto = this.mapper.mapArray(
      products,
      Product,
      ProductResponseDto,
    );
    return productsDto;
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

  async createManyProducts (
    file?: Express.Multer.File
  ) {
    const context = `${ProductService.name}.${this.createManyProducts.name}`;
    const workbook = new Workbook();
    if (!file?.buffer)
      throw new BadRequestException('File not found');

    await workbook.xlsx.load(file.buffer);

    if (_.isEmpty(workbook.worksheets))
      throw new BadRequestException('File not any sheets');

    const worksheet = workbook.getWorksheet(1);

    const validationData = this.validateDataFromExcel(worksheet);
    console.log({validationData});
    if(!_.isEmpty(validationData.errors)) {
      const formattedErrors = this.convertErrorsToExcelFormat(validationData.errors);
      const ws = reader.utils.json_to_sheet(formattedErrors);
      const validationWorkbook = reader.utils.book_new();
      reader.utils.book_append_sheet(validationWorkbook, ws, 'ValidationErrors');

      const excelBuffer = reader.write(validationWorkbook, { type: 'buffer', bookType: 'xlsx' });

      return { errors: true, excelBuffer};
    }

    const normalizedData = this.dataStandardization(validationData.data);
    
    const createdCatalogsAndSizes = await this.getListCreatedCatalogsAndSizes(
      normalizedData
    );


    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // code
      const createdCatalogs = await queryRunner.manager.save(
        createdCatalogsAndSizes.setCreatedCatalogs
      );
      
      const createdSizes = await queryRunner.manager.save(
        createdCatalogsAndSizes.setCreatedSizes
      );

      for(const productData of normalizedData) {
        let catalog = await this.catalogRepository.findOneBy({
          name: productData[2]
        });
        if(!catalog) {
          catalog = createdCatalogs.find((item) => item.name === productData[2]);
        }
        const newProduct = new Product();
        Object.assign(newProduct, {
          name: productData[1],
          description: productData[3],
          catalog
        });
        console.log({productData})
        console.log({newProduct})

        const createdProduct = await queryRunner.manager.save(newProduct);

        const newVariants: Variant[] = [];
        if(productData[6]) {
          let size = await this.sizeRepository.findOneBy({
            name: productData[6]
          });
          if(!size) {
            size = createdSizes.find((item) => item.name === productData[6]);
          }
          const newVariant = new Variant();
          Object.assign(newVariant, {
            product: createdProduct,
            size,
            price: productData[7]
          });
          newVariants.push(newVariant);
        }

        if(productData[8]) {
          let size = await this.sizeRepository.findOneBy({
            name: productData[8]
          });
          if(!size) {
            size = createdSizes.find((item) => item.name === productData[8]);
          }
          const newVariant = new Variant();
          Object.assign(newVariant, {
            product: createdProduct,
            size,
            price: productData[9]
          });
          newVariants.push(newVariant);
        }
        
        if(productData[10]) {
          let size = await this.sizeRepository.findOneBy({
            name: productData[10]
          });
          if(!size) {
            size = createdSizes.find((item) => item.name === productData[10]);
          }
          const newVariant = new Variant();
          Object.assign(newVariant, {
            product: createdProduct,
            size,
            price: productData[11]
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
      this.logger.warn(
        ProductValidation.CREATE_MANY_PRODUCTS_FAILED.message,
        context
      );
      console.log("lôiixiii", error)
      throw new ProductException(ProductValidation.CREATE_MANY_PRODUCTS_FAILED);
    } finally {
      await queryRunner.release();
    }

    
  }

  validateDataFromExcel(
    worksheet: Worksheet
  ) {
    const validateDataType = {
      2: 'string',
      3: 'string',
      7: 'string',
      8: 'number',
      9: 'string',
      10: 'number',
      11: 'string',
      12: 'number',
    };

    const requiredColumns = [2, 3];

    const errors = [];
    const data = [];
    const headerRow = worksheet.getRow(1);

    const headerRowValues = headerRow.values;
    worksheet.eachRow((row, rowNumber) => {
      if(rowNumber > 1) {
        if(!(row.values && Array.isArray(row.values))) {
          return;
        }
    
        const rowLength = row.values.length;
        // let rowErrors: { [key: string]: string } = {};
        let rowErrors: { [key: string]: string[] } = {};
        for(let colNumber = 1; colNumber <= rowLength; colNumber ++) {
          const expectedType = validateDataType[colNumber];
          const value = row.values[colNumber];
          const isRequired = requiredColumns.includes(colNumber);

          if(isRequired) {
            if(!value || value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
              // rowErrors.value = `${headerRowValues[colNumber]} là cột bắt buộc và không thể trống.`;
              rowErrors[colNumber] = rowErrors[colNumber] || [];
              rowErrors[colNumber].push(`${headerRowValues[colNumber]} là cột bắt buộc và không thể trống.`);
            } else {
              let actualType = typeof value;

              if (expectedType && actualType !== expectedType) {
                // rowErrors.value = `Giá trị "${value}" không thỏa mãn kiểu dữ liệu cho cột ${headerRowValues[colNumber]}. Mong đợi kiểu ${expectedType}, nhưng nhận được ${actualType}.`;
                rowErrors[colNumber] = rowErrors[colNumber] || [];
                rowErrors[colNumber].push(`Giá trị "${value}" không thỏa mãn kiểu dữ liệu cho cột ${headerRowValues[colNumber]}. Mong đợi kiểu ${expectedType}, nhưng nhận được ${actualType}.`);
              }
            }
          } else {
            if(value !== null && value !== undefined || (typeof value === 'string' && value.trim() === '')) {
              let actualType = typeof value;
              if (expectedType && actualType !== expectedType) {
                // rowErrors.value = `Giá trị "${value}" không thỏa mãn kiểu dữ liệu cho cột ${headerRowValues[colNumber]}. Mong đợi kiểu ${expectedType}, nhưng nhận được ${actualType}.`;
                rowErrors[colNumber] = rowErrors[colNumber] || [];
                rowErrors[colNumber].push(`Giá trị "${value}" không thỏa mãn kiểu dữ liệu cho cột ${headerRowValues[colNumber]}. Mong đợi kiểu ${expectedType}, nhưng nhận được ${actualType}.`);
              }
            }
          }
        }
        if (Object.keys(rowErrors).length > 0) {
          errors.push({ row: rowNumber, errors: rowErrors });
        }
        data.push(row.values.slice(1));
      }          
    });

    return {
      errors,
      data
    };
  }

  dataStandardization (
    data: any[][]
  ) {
    const result = [];
    data.forEach((rowData) => {
      const normalizedRowData = rowData;
      rowData.forEach((itemData, index) => {
        if(index === 2) {
          normalizedRowData[2] = itemData.toLocaleLowerCase();
        }
        if(index === 6) {
          normalizedRowData[6] = itemData.toLocaleLowerCase();
        }
        if(index === 8) {
          normalizedRowData[8] = itemData.toLocaleLowerCase();
        }
        if(index === 10) {
          normalizedRowData[10] = itemData.toLocaleLowerCase();
        }
      });

      result.push(normalizedRowData);
    });
    return result;
  }

  async getListCreatedCatalogsAndSizes(
    data: any[][]
  ) {
    const setCatalogs = new Set<string>();
    const setCreatedCatalogs: Catalog[] = []; // need create new
    const setSizes = new Set<string>();
    const setCreatedSizes: Size[] = []; // need create new
    data.forEach((rowData) => {
      rowData.forEach((itemData, index) => {
        if(index === 2) {
          setCatalogs.add(itemData);
        }
        if(index === 6) {
          setSizes.add(itemData);
        }
        if(index === 8) {
          setSizes.add(itemData);
        }
        if(index === 10) {
          setSizes.add(itemData);
        }
      });
    });

    for(const catalog of setCatalogs) {
      const queryCatalog = await this.catalogRepository.findOneBy({
        name: catalog
      });
      
      if(!queryCatalog) {
        const newCatalog = new Catalog();
        Object.assign(newCatalog, { name: catalog });
        setCreatedCatalogs.push(newCatalog);
      } 
    }
    for(const size of setSizes) {
      const querySize = await this.sizeRepository.findOneBy({
        name: size
      });
      if(!querySize) {
        const newSize = new Size();
        Object.assign(newSize, { name: size });
        setCreatedSizes.push(newSize);
      }
    }

    return {
      setCreatedSizes,
      setCreatedCatalogs
    }
  }
  
  convertErrorsToExcelFormat(errors: ValidationError[]): any[] {
    return errors.map(error => ({
        row: error.row,
        errors: Object.entries(error.errors)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ')
    }));
  }

  exportProducts(){
    
  }
}


