import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChefArea } from './chef-area.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChefAreaUtils } from './chef-area.utils';
import {
  ChefAreaResponseDto,
  CreateChefAreaRequestDto,
  QueryGetChefAreaRequestDto,
  UpdateChefAreaRequestDto,
} from './chef-area.dto';
import { BranchUtils } from 'src/branch/branch.utils';

@Injectable()
export class ChefAreaService {
  constructor(
    @InjectRepository(ChefArea)
    private chefAreaRepository: Repository<ChefArea>,
    @InjectMapper() private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly chefAreaUtils: ChefAreaUtils,
    private readonly branchUtils: BranchUtils,
  ) {}

  /**
   * Create new chef area
   * @param {CreateChefAreaRequestDto} requestData
   * @returns {ChefAreaResponseDto}
   * @throws {BranchException} if branch not found
   */
  async create(
    requestData: CreateChefAreaRequestDto,
  ): Promise<ChefAreaResponseDto> {
    const branch = await this.branchUtils.getBranch({
      where: { slug: requestData.branch },
    });
    const chefArea = this.mapper.map(
      requestData,
      CreateChefAreaRequestDto,
      ChefArea,
    );
    Object.assign(chefArea, {
      branch,
    });
    const createdChefArea = await this.chefAreaRepository.save(chefArea);
    return this.mapper.map(createdChefArea, ChefArea, ChefAreaResponseDto);
  }

  /**
   * Get all chef areas
   * @param {QueryGetChefAreaRequestDto} query
   * @returns {ChefAreaResponseDto[]}
   * @throws {BranchException} if branch not found
   */
  async getAll(
    query: QueryGetChefAreaRequestDto,
  ): Promise<ChefAreaResponseDto[]> {
    const where: FindOneOptions<ChefArea> = { relations: ['branch'] };
    if (query.branch) {
      const branch = await this.branchUtils.getBranch({
        where: { slug: query.branch },
      });
      Object.assign(where, {
        branch,
      });
    }

    const chefAreas = await this.chefAreaRepository.find(where);
    return this.mapper.mapArray(chefAreas, ChefArea, ChefAreaResponseDto);
  }

  /**
   * Get specific chef area
   * @param {string} slug
   * @returns {ChefAreaResponseDto}
   * @throws {ChefAreaException} if chef area not found
   */
  async getSpecific(slug: string): Promise<ChefAreaResponseDto> {
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug },
      relations: ['branch'],
    });
    return this.mapper.map(chefArea, ChefArea, ChefAreaResponseDto);
  }

  /**
   * Update chef area
   * @param {string} slug
   * @param {CreateChefAreaRequestDto} requestData
   * @returns {ChefAreaResponseDto}
   * @throws {ChefAreaException} if chef area not found
   * @throws {BranchException} if branch not found
   */
  async update(
    slug: string,
    requestData: CreateChefAreaRequestDto,
  ): Promise<ChefAreaResponseDto> {
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug },
    });
    const branch = await this.branchUtils.getBranch({
      where: { slug: requestData.branch },
    });
    const chefAreaData = this.mapper.map(
      requestData,
      UpdateChefAreaRequestDto,
      ChefArea,
    );
    Object.assign(chefArea, {
      ...chefAreaData,
      branch,
    });
    const updatedChefArea = await this.chefAreaRepository.save(chefArea);
    return this.mapper.map(updatedChefArea, ChefArea, ChefAreaResponseDto);
  }

  /**
   * Delete chef area
   * @param {string} slug
   * @returns {number}
   * @throws {ChefAreaException} if chef area not found
   */
  async delete(slug: string): Promise<number> {
    const chefArea = await this.chefAreaUtils.getChefArea({
      where: { slug },
    });
    const deleted = await this.chefAreaRepository.softDelete(chefArea.id);
    return deleted.affected || 0;
  }
}
