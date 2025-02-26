import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Banner } from './banner.entity';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import BannerValidation from './banner.validation';
import { BannerException } from './banner.exception';

@Injectable()
export class BannerUtils {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getBanner(slug: string): Promise<Banner> {
    const context = `${BannerUtils.name}.${this.getBanner.name}`;

    const banner = await this.bannerRepository.findOne({
      where: { slug },
    });

    if (!banner) {
      this.logger.warn(BannerValidation.BANNER_NOT_FOUND.message, context);
      throw new BannerException(BannerValidation.BANNER_NOT_FOUND);
    }

    return banner;
  }
}
