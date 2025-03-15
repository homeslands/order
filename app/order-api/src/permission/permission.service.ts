import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePermissionDto, PermissionResponseDto } from './permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Permission } from './permission.entity';
import { In, Repository } from 'typeorm';
import { Role } from 'src/role/role.entity';
import { RoleException } from 'src/role/role.exception';
import { RoleValidation } from 'src/role/role.validation';
import { Authority } from 'src/authority/authority.entity';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { PermissionValidation } from './permission.validation';
import { PermissionException } from './permission.exception';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Authority)
    private readonly authorityRepository: Repository<Authority>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionMaangerService: TransactionManagerService,
  ) {}

  async bulkCreate(createPermissionDto: CreatePermissionDto) {
    const context = `${PermissionService.name}.${this.bulkCreate.name}`;
    const role = await this.roleRepository.findOne({
      where: {
        slug: createPermissionDto.role,
      },
    });
    if (!role) throw new RoleException(RoleValidation.ROLE_NOT_FOUND);

    const authorities = await this.authorityRepository.findBy({
      slug: In([...createPermissionDto.authorities]),
    });

    for (const authority of authorities) {
      const permission = await this.permissionRepository.findOne({
        where: {
          role: {
            slug: role.slug,
          },
          authority: {
            slug: authority.slug,
          },
        },
      });
      if (permission)
        throw new PermissionException(PermissionValidation.PERMISSION_EXISTED);
    }

    const permissions = authorities.map((authority) => {
      const permission = this.mapper.map(
        createPermissionDto,
        CreatePermissionDto,
        Permission,
      );
      Object.assign(permission, {
        role,
        authority,
      });
      return permission;
    });

    const createdPermissions = await this.transactionMaangerService.execute<
      Permission[]
    >(
      async (manager) => {
        return await manager.save(permissions);
      },
      (result) => {
        this.logger.log(
          `Permissions ${result.map((item) => `${item.role?.name} - ${item.authority.name}`).join(', ')} created successfully`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Failed to create permission: ${error.message}`,
          error.stack,
          context,
        );
        throw new PermissionException(
          PermissionValidation.PERMISSION_CREATE_FAILED,
        );
      },
    );

    return this.mapper.mapArray(
      createdPermissions,
      Permission,
      PermissionResponseDto,
    );
  }

  async remove(slug: string) {
    const context = `${PermissionService.name}.${this.remove.name}`;
    const permission = await this.permissionRepository.findOne({
      where: {
        slug,
      },
    });
    if (!permission) throw new Error('Permission not found');

    const result = await this.transactionMaangerService.execute<Permission>(
      async (manager) => {
        return await manager.remove(permission);
      },
      () => {
        this.logger.log(`Permission ${slug} removed successfully`, context);
      },
      (error) => {
        this.logger.error(
          `Failed to remove permission: ${error.message}`,
          error.stack,
          context,
        );
        throw new PermissionException(
          PermissionValidation.PERMISSION_REMOVE_FAILED,
        );
      },
    );

    return this.mapper.map(result, Permission, PermissionResponseDto);
  }
}
