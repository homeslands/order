import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { IsNull, Repository } from 'typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { CreateRoleDto, RoleResponseDto, UpdateRoleDto } from './role.dto';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { RoleException } from './role.exception';
import { RoleValidation } from './role.validation';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly transactionMangerService: TransactionManagerService,
  ) {}

  async remove(slug: string) {
    const context = `${RoleService.name}.${this.remove.name}`;
    const role = await this.roleRepository.findOne({
      where: {
        slug,
      },
    });
    if (!role) throw new RoleException(RoleValidation.ROLE_NOT_FOUND);

    await this.transactionMangerService.execute<Role>(
      async (manager) => {
        return await manager.remove(role);
      },
      (result) => {
        this.logger.log(`Role ${result.name} has been removed successfully`);
      },
      (error) => {
        this.logger.error(
          `Failed to remove role ${role.name}. Error: ${error.message}`,
          error.stack,
          context,
        );
        throw new RoleException(RoleValidation.ROLE_REMOVE_FAILED);
      },
    );
  }

  async update(slug: string, updateRoleDto: UpdateRoleDto) {
    const context = `${RoleService.name}.${this.update.name}`;

    const role = await this.roleRepository.findOne({
      where: {
        slug,
      },
    });
    if (!role) throw new RoleException(RoleValidation.ROLE_NOT_FOUND);

    Object.assign(role, {
      ...updateRoleDto,
    });

    const updatedRole = await this.transactionMangerService.execute<Role>(
      async (manager) => {
        return await manager.save(role);
      },
      (result) => {
        this.logger.log(`Role ${result.name} has been updated successfully`);
      },
      (error) => {
        this.logger.error(
          `Failed to update role ${role.name}. Error: ${error.message}`,
          error.stack,
          context,
        );
        throw new RoleException(RoleValidation.ROLE_UPDATE_FAILED);
      },
    );
    return this.mapper.map(updatedRole, Role, RoleResponseDto);
  }

  async create(createRoleDto: CreateRoleDto) {
    const context = `${RoleService.name}.${this.create.name}`;
    const role = this.mapper.map(createRoleDto, CreateRoleDto, Role);
    const createdRole = await this.transactionMangerService.execute<Role>(
      async (manager) => {
        return await manager.save(role);
      },
      (result) => {
        this.logger.log(`Role ${result.name} has been created successfully`);
      },
      (error) => {
        this.logger.error(
          `Failed to create role ${role.name}. Error: ${error.message}`,
          error.stack,
          context,
        );
        throw new RoleException(RoleValidation.ROLE_CREATE_FAILED);
      },
    );
    return this.mapper.map(createdRole, Role, RoleResponseDto);
  }

  async findOne(slug: string) {
    const role = await this.roleRepository.findOne({
      where: {
        slug: slug ?? IsNull(),
      },
      relations: ['permissions.authority'],
    });
    if (!role) throw new RoleException(RoleValidation.ROLE_NOT_FOUND);
    return this.mapper.map(role, Role, RoleResponseDto);
  }

  async findAll() {
    const roles = await this.roleRepository.find({
      relations: ['permissions.authority'],
    });
    return this.mapper.mapArray(roles, Role, RoleResponseDto);
  }
}
