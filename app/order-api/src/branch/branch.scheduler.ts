import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Branch } from './branch.entity';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class BranchScheduler {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  //   Create default branch if not exist
  // @Timeout(1000)
  // async initBranch() {
  //   const context = `${BranchScheduler.name}.${this.initBranch.name}`;
  //   const branch = await this.branchRepository.findOne({
  //     where: {
  //       name: Like(`%${DefaultBranchName}%`),
  //     },
  //   });
  //   if (branch) {
  //     this.logger.log(`Default branch ${branch.slug} already exist`, context);
  //     return;
  //   }

  //   const defaultBranch = new Branch();
  //   defaultBranch.name = DefaultBranchName;
  //   defaultBranch.address = DefaultBranchAddress;

  //   await this.branchRepository.manager.transaction(async (manager) => {
  //     try {
  //       await manager.save(defaultBranch);
  //       this.logger.log(
  //         `Default branch created ${defaultBranch.slug}`,
  //         context,
  //       );
  //     } catch (error) {
  //       this.logger.error(
  //         `Error while creating default branch ${error.message}`,
  //         null,
  //         context,
  //       );
  //     }
  //   });
  // }
}
