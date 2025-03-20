import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthorityGroup } from './authority-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthorityGroupResponseDto } from './authority-group.dto';
import { Permission } from 'src/permission/permission.entity';

@Injectable()
export class AuthorityGroupService {
  constructor(
    @InjectRepository(AuthorityGroup)
    private readonly authorityGroupRepository: Repository<AuthorityGroup>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionManangerService: TransactionManagerService,
  ) {}

  async findAll() {
    const authorityGroups = await this.authorityGroupRepository.find({
      relations: ['authorities'],
    });
    return this.mapper.mapArray(
      authorityGroups,
      AuthorityGroup,
      AuthorityGroupResponseDto,
    );
  }
}
