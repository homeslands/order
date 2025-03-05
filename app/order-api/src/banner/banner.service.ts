import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Banner } from './banner.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Mapper } from '@automapper/core';
import {
  BannerResponseDto,
  CreateBannerRequestDto,
  GetBannerQueryDto,
  UpdateBannerRequestDto,
} from './banner.dto';
import { InjectMapper } from '@automapper/nestjs';
import { BannerUtils } from './banner.utils';
import { FileService } from 'src/file/file.service';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { BannerException } from './banner.exception';
import BannerValidation from './banner.validation';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly bannerUtils: BannerUtils,
    private readonly fileService: FileService,
    private readonly transactionManager: TransactionManagerService,
  ) {}

  async createBanner(
    requestData: CreateBannerRequestDto,
  ): Promise<BannerResponseDto> {
    const context = `${BannerService.name}.${this.createBanner.name}`;

    const bannerData = this.mapper.map(
      requestData,
      CreateBannerRequestDto,
      Banner,
    );

    const createdBanner = await this.transactionManager.execute<Banner>(
      async (manager) => {
        return await manager.save(bannerData);
      },
      (result) => {
        this.logger.log(`Create banner ${result.title} successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Create banner failed: ${error.message}`,
          error.stack,
          context,
        );
        throw new BannerException(
          BannerValidation.CREATE_BANNER_FAILED,
          error.message,
        );
      },
    );

    return this.mapper.map(createdBanner, Banner, BannerResponseDto);
  }

  async getAllBanners(query: GetBannerQueryDto): Promise<BannerResponseDto[]> {
    const context = `${BannerService.name}.${this.getAllBanners.name}`;

    const where: FindOptionsWhere<Banner> = {};
    if (query.isActive) {
      where.isActive = query.isActive;
    }
    const banners = await this.bannerRepository.find({ where });

    this.logger.log('Get all banners successfully', context);

    return this.mapper.mapArray(banners, Banner, BannerResponseDto);
  }

  async getSpecificBanner(slug: string): Promise<BannerResponseDto> {
    const banner = await this.bannerUtils.getBanner(slug);
    return this.mapper.map(banner, Banner, BannerResponseDto);
  }

  async updateBanner(
    slug: string,
    requestData: UpdateBannerRequestDto,
  ): Promise<BannerResponseDto> {
    const context = `${BannerService.name}.${this.updateBanner.name}`;

    const banner = await this.bannerUtils.getBanner(slug);

    const updateData = this.mapper.map(
      requestData,
      UpdateBannerRequestDto,
      Banner,
    );
    Object.assign(banner, updateData);

    const updatedBanner = await this.transactionManager.execute<Banner>(
      async (manager) => {
        return await manager.save(banner);
      },
      (result) => {
        this.logger.log(`Banner ${result.title} updated successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Update banner failed: ${error.message}`,
          error.stack,
          context,
        );
        throw new BannerException(
          BannerValidation.UPDATE_BANNER_FAILED,
          error.message,
        );
      },
    );

    return this.mapper.map(updatedBanner, Banner, BannerResponseDto);
  }

  async uploadImageBanner(
    slug: string,
    file: Express.Multer.File,
  ): Promise<BannerResponseDto> {
    const context = `${BannerService.name}.${this.uploadImageBanner.name}`;

    const banner = await this.bannerUtils.getBanner(slug);

    // remove old banner
    this.fileService.removeFile(banner.image);

    const image = await this.fileService.uploadFile(file);
    banner.image = `${image.name}`;
    const updatedBanner = await this.bannerRepository.save(banner);

    this.logger.log(
      `Banner image ${image.name} uploaded successfully`,
      context,
    );
    return this.mapper.map(updatedBanner, Banner, BannerResponseDto);
  }

  async deleteBanner(slug: string): Promise<number> {
    const banner = await this.bannerUtils.getBanner(slug);

    const deleted = await this.bannerRepository.softDelete(banner.id);
    return deleted.affected | 0;
  }
}
