import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  BranchResponseDto,
  CreateBranchDto,
  UpdateBranchDto,
} from './branch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { BranchException } from './branch.exception';
import { BranchValidation } from './branch.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { BranchUtils } from './branch.utils';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch) private branchRepository: Repository<Branch>,
    @InjectMapper() private mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly branchUtil: BranchUtils,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  /**
   * Update branch
   * @param {string} slug
   * @param {UpdateBranchDto} requestData
   * @returns {Promise<BranchResponseDto>} Branch updated successfully
   * @throws {BranchException} Branch not found
   */
  async updateBranch(
    slug: string,
    requestData: UpdateBranchDto,
  ): Promise<BranchResponseDto> {
    const context = `${BranchService.name}.${this.updateBranch.name}`;
    const branch = await this.branchUtil.getBranch({
      where: {
        slug,
      },
    });
    if (!branch) throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);

    // Update branch
    Object.assign(branch, {
      ...requestData,
    });

    const updateBranch = await this.transactionManagerService.execute<Branch>(
      async (manager) => {
        return manager.save(branch);
      },
      (result) => {
        this.logger.log(`Branch ${result.name} updated successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Error when updating branch: ${error.message}`,
          error.stack,
          context,
        );
        throw new BranchException(
          BranchValidation.ERROR_WHEN_UPDATE_BRANCH,
          error.message,
        );
      },
    );

    return this.mapper.map(updateBranch, Branch, BranchResponseDto);
  }

  /**
   * Create new branch
   * @param {CreateBranchDto} requestData
   * @returns {Promise<BranchResponseDto>} New branch created successfully
   */
  async createBranch(requestData: CreateBranchDto): Promise<BranchResponseDto> {
    const context = `${BranchService.name}.${this.createBranch.name}`;
    const branch = this.mapper.map(requestData, CreateBranchDto, Branch);

    const createdBranch = await this.transactionManagerService.execute<Branch>(
      async (manager) => {
        return manager.save(branch);
      },
      (result) => {
        this.logger.log(`Branch ${result.name} created successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Error when creating branch: ${error.message}`,
          error.stack,
          context,
        );
        throw new BranchException(
          BranchValidation.ERROR_WHEN_CREATE_BRANCH,
          error.message,
        );
      },
    );

    return this.mapper.map(createdBranch, Branch, BranchResponseDto);
  }

  /**
   * Retrieve all branch
   * @returns {Promise<BranchResponseDto[]>} All branchs have been retrieved successfully
   */
  async getAllBranches(): Promise<BranchResponseDto[]> {
    const branches = await this.branchRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
    return this.mapper.mapArray(branches, Branch, BranchResponseDto);
  }

  /**
   * Delete branch
   * @param {string} slug
   * @returns {Promise<BranchResponseDto>} Number of branch deleted
   * @throws {BranchException} Error when delete branch
   */
  async deleteBranch(slug: string): Promise<BranchResponseDto> {
    const context = `${BranchService.name}.${this.deleteBranch.name}`;

    const branch = await this.branchUtil.getBranch({
      where: {
        slug,
      },
    });

    const deletedBranch = await this.transactionManagerService.execute<Branch>(
      async (manager) => {
        return manager.remove(branch);
      },
      (result) => {
        this.logger.log(`Branch ${result.name} deleted successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Error when deleting branch: ${error.message}`,
          error.stack,
          context,
        );
        throw new BranchException(
          BranchValidation.ERROR_WHEN_DELETE_BRANCH,
          error.message,
        );
      },
    );

    return this.mapper.map(deletedBranch, Branch, BranchResponseDto);
  }
}
