import { Inject, Injectable, Logger } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RoleEnum } from './role.enum';
import * as _ from 'lodash';
import {
  GRANT_SUPPER_ADMIN_PERMISSIONS_JOB,
  INIT_ROLES_JOB,
} from './role.constant';
import { Authority } from 'src/authority/authority.entity';
import { Permission } from 'src/permission/permission.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class RoleScheduler {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Authority)
    private readonly authorityRepository: Repository<Authority>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  @Timeout(INIT_ROLES_JOB, 1000) // Called once after 1 second
  async initRoles() {
    const context = `${RoleScheduler.name}.${this.initRoles.name}`;
    this.logger.log(`Initializing roles...`, context);

    const existingRoles = await this.roleRepository.find({
      select: ['name'], // Fetch only the names to minimize data load
    });

    // Identify missing roles
    const missingRoles = Object.values(RoleEnum)
      .filter((role) => !existingRoles.some((item) => item.name === role))
      .map((role) => {
        const newRole = new Role();
        Object.assign(newRole, {
          name: role,
          description: role,
        } as Role);
        return newRole;
      });

    if (_.isEmpty(missingRoles)) {
      this.logger.log('No missing roles. Initialization skipped.', context);
      return;
    }

    this.roleRepository.manager.transaction(async (manager) => {
      try {
        await manager.save(missingRoles);
        this.logger.log(
          `Missing roles created: ${missingRoles.map((r) => r.name).join(', ')}`,
          context,
        );
      } catch (error) {
        this.logger.error(
          `Error when initializing roles: ${error.message}`,
          error.stack,
          context,
        );
      }
    });
  }

  // Grant the super admin full permissions.
  @Timeout(GRANT_SUPPER_ADMIN_PERMISSIONS_JOB, 3000) // Called once after 3 second
  async grantSuperAdminPermissionsJob() {
    const context = `${RoleScheduler.name}.${this.grantSuperAdminPermissionsJob.name}`;
    const role = await this.roleRepository.findOne({
      where: {
        name: RoleEnum.SuperAdmin.toString(),
      },
    });
    if (!role) {
      this.logger.warn(
        `Role ${RoleEnum.SuperAdmin} is not Initialized`,
        context,
      );
      return;
    }

    const authorities = await this.authorityRepository.find();

    // Filter authorities is not granted for super admin
    const authoritiesSettledResults = await Promise.allSettled(
      authorities.map(async (item) => {
        const permission = await this.permissionRepository.findOne({
          where: {
            role: {
              id: role.id,
            },
            authority: {
              id: item.id,
            },
          },
        });
        return !permission ? item : null;
      }),
    );

    const fulfilledResults = authoritiesSettledResults
      .filter((item) => item.status === 'fulfilled')
      .map((item) => item.value)
      .filter((item) => item);

    // Create permission
    const permissions = fulfilledResults.map((item) => {
      const p = new Permission();
      p.authority = item;
      p.role = role;
      return p;
    });

    await this.transactionManagerService.execute<Permission[]>(
      async (manager) => {
        return await manager.save(permissions);
      },
      (results) => {
        this.logger.log(
          `Permission [${results.map((item) => `${item.role?.description} - ${item.authority?.code}`).join(', ')}] created`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Error when granting permissions: ${error.message}`,
          error.stack,
          context,
        );
      },
    );
  }
}
