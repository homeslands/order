import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Timeout } from '@nestjs/schedule';
import _ from 'lodash';
import { AuthorityGroup } from 'src/authority-group/authority-group.entity';
import * as fs from 'fs';
import * as path from 'path';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { AuthorityGroupJSON } from './authority-group.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Authority } from 'src/authority/authority.entity';
import { AuthorityJSON } from 'src/authority/authority.dto';

@Injectable()
export class AuthorityGroupScheduler {
  constructor(
    @InjectRepository(AuthorityGroup)
    private readonly authorityGroupRepository: Repository<AuthorityGroup>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  @Timeout(3000) // Run this method 5 seconds after the app starts
  async handleInitAuthorityGroup() {
    const context = `${AuthorityGroup.name}.${this.handleInitAuthorityGroup.name}`;

    let authorityGroupsJSON: AuthorityGroupJSON[] = [];

    try {
      const filePath = path.resolve('public/json/authorities.json'); // Adjust the path accordingly
      authorityGroupsJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      this.logger.error(
        `Error while reading authorities json file: ${error.message}`,
        error.stack,
        context,
      );
      return;
    }

    if (!_.isArray(authorityGroupsJSON)) {
      this.logger.warn(`Invalid authorities.json format`, context);
      return;
    }

    const filterAuthorityGroups = await Promise.all(
      authorityGroupsJSON.map(async (item) => {
        const existedAuthorityGroup =
          await this.authorityGroupRepository.findOne({
            where: {
              code: item.code,
            },
          });
        return !existedAuthorityGroup ? item : null;
      }),
    );

    const authorityGroups = filterAuthorityGroups
      .filter((item) => item)
      .map((item) => {
        const authorityGroup = this.mapper.map(
          item,
          AuthorityGroupJSON,
          AuthorityGroup,
        );
        authorityGroup.authorities = this.mapper.mapArray(
          item.authorities,
          AuthorityJSON,
          Authority,
        );
        return authorityGroup;
      });

    await this.transactionManagerService.execute<AuthorityGroup[]>(
      async (manager) => {
        return await manager.save(authorityGroups);
      },
      (result) => {
        this.logger.log(
          `Authority groups [${result.map((item) => item.name).join(', ')}] saved`,
          context,
        );
      },
      (error: { message: string; stack: any }) => {
        this.logger.error(
          `Error while saving authority groups: ${error.message}`,
          error.stack,
          context,
        );
      },
    );
  }
}
