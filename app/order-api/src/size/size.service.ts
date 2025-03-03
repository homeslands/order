import { Injectable, Logger, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';

import {
  CreateSizeRequestDto,
  SizeResponseDto,
  UpdateSizeRequestDto,
} from './size.dto';
import { Size } from './size.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SizeException } from './size.exception';
import { SizeValidation } from './size.validation';

@Injectable()
export class SizeService {
  constructor(
    @InjectRepository(Size)
    private readonly sizeRepository: Repository<Size>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Create a new size
   * @param  {CreateSizeRequestDto} createSizeDto The data to create a new size
   * @returns {Promise<SizeResponseDto>} The size data is created
   * @throws {SizeException} If size name does exist
   */
  async createSize(
    createSizeDto: CreateSizeRequestDto,
  ): Promise<SizeResponseDto> {
    const context = `${SizeService.name}.${this.createSize.name}`;
    const sizeData = this.mapper.map(createSizeDto, CreateSizeRequestDto, Size);
    const size = await this.sizeRepository.findOneBy({
      name: sizeData.name,
    });
    if (size) {
      this.logger.warn(`Size name ${createSizeDto.name} does exists`, context);
      throw new SizeException(SizeValidation.SIZE_NAME_DOES_EXIST);
    }

    const newSize = this.sizeRepository.create(sizeData);
    const createdSize = await this.sizeRepository.save(newSize);
    this.logger.log(`Size ${createSizeDto.name} created successfully`, context);
    const sizeDto = this.mapper.map(createdSize, Size, SizeResponseDto);
    return sizeDto;
  }

  /**
   * Get all sizes
   * @returns {Promise<SizeResponseDto[]>} The size array is retrieved
   */
  async getAllSizes(): Promise<SizeResponseDto[]> {
    const sizes = await this.sizeRepository.find();
    const sizesDto = this.mapper.mapArray(sizes, Size, SizeResponseDto);
    return sizesDto;
  }

  /**
   * Update size by slug
   * @param {string} slug The slug of size
   * @param {UpdateSizeRequestDto} requestData The data to update size
   * @returns {Promise<SizeResponseDto>} The updated size
   * @throws {SizeException} If size is not found
   * @throws {SizeException} If the updated name of size that already exists
   */
  async updateSize(
    slug: string,
    requestData: UpdateSizeRequestDto,
  ): Promise<SizeResponseDto> {
    const context = `${SizeService.name}.${this.updateSize.name}`;
    const size = await this.sizeRepository.findOneBy({ slug });
    if (!size) {
      this.logger.warn(`Size ${slug} not found`, context);
      throw new SizeException(SizeValidation.SIZE_NOT_FOUND);
    }
    const sizeData = this.mapper.map(requestData, UpdateSizeRequestDto, Size);
    const isExist = await this.isExistUpdatedName(sizeData.name, size.name);
    if (isExist) {
      this.logger.warn(
        `The updated name ${sizeData.name} does exists`,
        context,
      );
      throw new SizeException(SizeValidation.SIZE_NAME_DOES_EXIST);
    }

    Object.assign(size, sizeData);
    const updatedSize = await this.sizeRepository.save(size);
    this.logger.log(`Size ${slug} updated successfully`, context);
    const sizeDto = this.mapper.map(updatedSize, Size, SizeResponseDto);
    return sizeDto;
  }

  /**
   * Check the updated name does exist or not
   * @param {string} updatedName The name to update for size
   * @param currentName The current name of size
   * @returns {Promise<Boolean>} The result of checking is true or false
   */
  async isExistUpdatedName(
    updatedName: string,
    currentName: string,
  ): Promise<boolean> {
    if (updatedName === currentName) return false;

    const sizeExist = await this.sizeRepository.findOne({
      where: { name: updatedName },
    });
    if (sizeExist) return true;

    return false;
  }

  /**
   * Delete size by slug
   * @param {string} slug The slug of size is deleted
   * @returns {Promise<number>} The number of sizes is deleted
   * @throws {SizeException} If the size is not found
   * @throws {SizeException} If the size have related variants
   */
  async deleteSize(slug: string): Promise<number> {
    const context = `${SizeService.name}.${this.deleteSize.name}`;
    const size = await this.sizeRepository.findOne({
      where: {
        slug,
      },
      relations: ['variants'],
    });

    if (!size) throw new SizeException(SizeValidation.SIZE_NOT_FOUND);
    if (size.variants.length > 0) {
      this.logger.warn(
        `Must change size of variants before delete size ${slug}`,
        context,
      );
      throw new SizeException(
        SizeValidation.MUST_CHANGE_SIZE_OF_VARIANTS_BEFORE_DELETE,
      );
    }

    const deleted = await this.sizeRepository.softDelete({ slug });
    this.logger.log(`Size ${slug} deleted successfully`, context);
    return deleted.affected || 0;
  }

  /**
   * Find a size by slug
   * @param {string} slug The slug of size
   * @returns {Promise<Size | null>} The size data is retrieve
   */
  async findOne(slug: string): Promise<Size | null> {
    return await this.sizeRepository.findOneBy({ slug });
  }
}
