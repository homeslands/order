import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { BranchValidation } from './branch.validation';
import { BranchException } from './branch.exception';

@Injectable()
export class BranchUtils {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async getBranch(where: FindOptionsWhere<Branch>): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where });
    if (!branch) throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
    return branch;
  }
}
