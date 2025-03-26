import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Authority } from './authority.entity';
import { Timeout } from '@nestjs/schedule';
import _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { AuthorityGroupJSON } from 'src/authority-group/authority-group.dto';
import { AuthorityGroup } from 'src/authority-group/authority-group.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { AuthorityJSON } from './authority.dto';

@Injectable()
export class AuthorityScheduler {
  constructor(
    @InjectRepository(Authority)
    private readonly authorityRepository: Repository<Authority>,
    @InjectRepository(AuthorityGroup)
    private readonly authorityGroupRepository: Repository<AuthorityGroup>,
    private readonly transactionManagerService: TransactionManagerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  @Timeout(5000) // Run this method 5 seconds after the app starts
  async handleInitAuthority() {
    const context = `${AuthorityScheduler.name}.${this.handleInitAuthority.name}`;

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
        const authorityGroup = await this.authorityGroupRepository.findOne({
          where: {
            code: item.code,
          },
          relations: ['authorities'],
        });
        if (!authorityGroup) return null;

        const authoritiesJSON = await Promise.all(
          item.authorities.map(async (item) => {
            const existedAuthority = await this.authorityRepository.findOne({
              where: {
                code: item.code,
              },
            });
            return !existedAuthority ? item : null;
          }),
        );

        const filterdAuthoritiesJSON = authoritiesJSON.filter((item) => item);
        if (_.isEmpty(filterdAuthoritiesJSON)) return null;

        const authorities = filterdAuthoritiesJSON
          .filter((item) => item)
          .map((item) => this.mapper.map(item, AuthorityJSON, Authority));
        authorityGroup.authorities.push(...authorities);
        return authorityGroup;
      }),
    );

    const authorityGroups = filterAuthorityGroups.filter((item) => item);

    await this.transactionManagerService.execute<AuthorityGroup[]>(
      async (manager) => {
        return await manager.save(authorityGroups);
      },
      (result) => {
        this.logger.log(
          `Authority [${result.map((item) => `${item.code} - ${item.authorities?.map((item) => `${item.code}`).join(', ')}`).join(', ')}] saved`,
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
