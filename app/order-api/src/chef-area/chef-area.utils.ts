import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChefArea } from './chef-area.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import ChefAreaValidation from './chef-area.validation';
import { ChefAreaException } from './chef-area.exception';

@Injectable()
export class ChefAreaUtils {
  constructor(
    @InjectRepository(ChefArea)
    private readonly chefAreaRepository: Repository<ChefArea>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getChefArea(options: FindOneOptions<ChefArea>): Promise<ChefArea> {
    const context = `${ChefAreaUtils.name}.${this.getChefArea.name}`;

    const chefArea = await this.chefAreaRepository.findOne({ ...options });
    if (!chefArea) {
      this.logger.warn(ChefAreaValidation.CHEF_AREA_NOT_FOUND.message, context);
      throw new ChefAreaException(ChefAreaValidation.CHEF_AREA_NOT_FOUND);
    }

    return chefArea;
  }
}
