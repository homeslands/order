import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Authority } from './authority.entity';
import { Timeout } from '@nestjs/schedule';
import _ from 'lodash';
import { AuthorityGroup } from 'src/authority-group/authority-group.entity';
import * as fs from 'fs';
import * as path from 'path';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class AuthorityScheduler {
  constructor(
    @InjectRepository(Authority)
    private readonly authorityRepository: Repository<Authority>,
    private readonly transactionManagerService: TransactionManagerService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Timeout(5000) // Run this method 5 seconds after the app starts
  async handleInitAuthority() {
    const context = `${AuthorityScheduler.name}.${this.handleInitAuthority.name}`;

    const authorities = await this.authorityRepository.find();
    if (!_.isEmpty(authorities)) {
      this.logger.warn(`Authorities already initialized`, context);
      return;
    }

    let authorityJSON = [];

    try {
      const filePath = path.resolve('public/json/authorities.json'); // Adjust the path accordingly
      authorityJSON = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      this.logger.error(
        `Error while reading authorities json file: ${error.message}`,
        error.stack,
        context,
      );
      return;
    }

    if (!_.isArray(authorityJSON)) {
      this.logger.warn(`Invalid authorities.json format`, context);
      return;
    }

    const authorityGroups = authorityJSON.map(
      (item: {
        group: string;
        code: string;
        authorities: {
          name: string;
          code: string;
          description: string;
        }[];
      }) => {
        const authorityGroup = new AuthorityGroup();
        authorityGroup.name = item.group;
        authorityGroup.code = item.code;
        const authorities = item.authorities.map((authority) => {
          const auth = new Authority();
          auth.name = authority.name;
          auth.code = authority.code;
          auth.description = authority.description;
          return auth;
        });
        authorityGroup.authorities = authorities;
        return authorityGroup;
      },
    );

    await this.transactionManagerService.execute<AuthorityGroup[]>(
      async (manager) => {
        return await manager.save(authorityGroups);
      },
      (result) => {
        this.logger.log(
          `Authority groups ${result.map((item) => item.name).join(', ')} saved`,
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
