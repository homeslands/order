import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BranchResponseDto,
  CreateBranchDto,
  UpdateBranchDto,
} from './branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { BranchException } from './branch.exception';
import { BranchValidation } from './branch.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BranchUtils } from './branch.utils';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectMapper() private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly branchUtil: BranchUtils,
  ) {}

  async updateBranch(slug: string, requestData: UpdateBranchDto) {
    const context = `${BranchService.name}.${this.updateBranch.name}`;
    const branch = await this.branchRepository.findOne({
      where: {
        slug,
      },
    });
    if (!branch) throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);

    // Update branch
    Object.assign(branch, {
      ...requestData,
    });

    try {
      const updatedBranch = await this.branchRepository.save(branch);
      return this.mapper.map(updatedBranch, Branch, BranchResponseDto);
    } catch (error) {
      this.logger.error(
        `Error when updating branch: ${error.message}`,
        error.stack,
        context,
      );
    }
  }

  /**
   * Create new branch
   * @param {CreateBranchDto} requestData
   * @returns {Promise<BranchResponseDto>} New branch created successfully
   */
  async createBranch(requestData: CreateBranchDto): Promise<BranchResponseDto> {
    const branch = this.mapper.map(requestData, CreateBranchDto, Branch);

    this.branchRepository.create(branch);
    const createBranch = await this.branchRepository.save(branch);

    return this.mapper.map(createBranch, Branch, BranchResponseDto);
  }

  /**
   * Retrieve all branch
   * @returns {Promise<BranchResponseDto[]>} All branchs have been retrieved successfully
   */
  async getAllBranches(): Promise<BranchResponseDto[]> {
    const branches = await this.branchRepository.find();
    return this.mapper.mapArray(branches, Branch, BranchResponseDto);
  }

  async deleteBranch(slug: string): Promise<number> {
    const context = `${BranchService.name}.${this.deleteBranch.name}`;

    const findOptionsWhere: FindOptionsWhere<Branch> = { slug };
    const branch = await this.branchUtil.getBranch(findOptionsWhere);

    try {
      const removed = await this.branchRepository.delete(branch.id);
      return removed.affected || 0;
    } catch (error) {
      this.logger.error(
        BranchValidation.ERROR_WHEN_DELETE_BRANCH.message,
        error.stack,
        context,
      );
      throw new BranchException(BranchValidation.ERROR_WHEN_DELETE_BRANCH);
    }
  }
}
