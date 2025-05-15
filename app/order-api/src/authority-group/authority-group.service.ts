import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthorityGroup } from './authority-group.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { IsNull, Repository } from 'typeorm';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  AuthorityGroupResponseDto,
  UpdateAuthorityGroupDto,
} from './authority-group.dto';
import { AuthorityGroupException } from './authority-group.exception';
import { AuthorityGroupValidation } from './authority-group.validation';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class AuthorityGroupService {
  constructor(
    @InjectRepository(AuthorityGroup)
    private readonly authorityGroupRepository: Repository<AuthorityGroup>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  /**
   * Get all authority groups
   * @returns {Promise<AuthorityGroupResponseDto[]>} List of authority groups
   */
  async findAll(): Promise<AuthorityGroupResponseDto[]> {
    const authorityGroups = await this.authorityGroupRepository.find({
      relations: ['authorities'],
    });
    return this.mapper.mapArray(
      authorityGroups,
      AuthorityGroup,
      AuthorityGroupResponseDto,
    );
  }

  /**
   * Update an authority group
   * @param slug - The slug of the authority group to update
   * @param updateAuthorityGroupDto - The update authority group dto
   * @returns {Promise<AuthorityGroupResponseDto>} The updated authority group
   * @throws {AuthorityGroupException} If the authority group is not found
   */
  async update(
    slug: string,
    updateAuthorityGroupDto: UpdateAuthorityGroupDto,
  ): Promise<AuthorityGroupResponseDto> {
    const context = `${AuthorityGroupService.name}.${this.update.name}`;

    const authorityGroup = await this.authorityGroupRepository.findOne({
      where: { slug: slug ?? IsNull() },
    });
    if (!authorityGroup) {
      throw new AuthorityGroupException(
        AuthorityGroupValidation.AUTHORITY_GROUP_NOT_FOUND,
      );
    }

    const previousAuthorityGroup = `${authorityGroup.name} - ${authorityGroup.code}`;

    Object.assign(authorityGroup, updateAuthorityGroupDto);

    const updatedAuthorityGroup =
      await this.transactionManagerService.execute<AuthorityGroup>(
        async (manager) => {
          return manager.save(authorityGroup);
        },
        (result) => {
          this.logger.log(
            `Authority group updated: ${previousAuthorityGroup} -> ${result.name} - ${result.code}`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error updating authority group: ${previousAuthorityGroup} -> ${error.message}`,
            context,
          );
          throw new AuthorityGroupException(
            AuthorityGroupValidation.AUTHORITY_GROUP_UPDATE_FAILED,
            error.message,
          );
        },
      );

    return this.mapper.map(
      updatedAuthorityGroup,
      AuthorityGroup,
      AuthorityGroupResponseDto,
    );
  }

  /**
   * Delete an authority group
   * @param slug - The slug of the authority group to delete
   * @returns {Promise<AuthorityGroupResponseDto>} The deleted authority group
   * @throws {AuthorityGroupException} If the authority group is not found
   */
  async delete(slug: string): Promise<AuthorityGroupResponseDto> {
    const context = `${AuthorityGroupService.name}.${this.delete.name}`;

    const authorityGroup = await this.authorityGroupRepository.findOne({
      where: { slug: slug ?? IsNull() },
    });

    if (!authorityGroup) {
      throw new AuthorityGroupException(
        AuthorityGroupValidation.AUTHORITY_GROUP_NOT_FOUND,
      );
    }

    await this.transactionManagerService.execute<AuthorityGroup>(
      async (manager) => {
        return manager.remove(authorityGroup);
      },
      (result) => {
        this.logger.log(
          `Authority group deleted: ${result.name} - ${result.code}`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Error deleting authority group: ${error.message}`,
          error.stack,
          context,
        );
        throw new AuthorityGroupException(
          AuthorityGroupValidation.AUTHORITY_GROUP_DELETE_FAILED,
          error.message,
        );
      },
    );

    return this.mapper.map(
      authorityGroup,
      AuthorityGroup,
      AuthorityGroupResponseDto,
    );
  }

  /**
   * Find an authority group by slug
   * @param slug - The slug of the authority group to find
   * @returns {Promise<AuthorityGroupResponseDto>} The authority group
   * @throws {AuthorityGroupException} If the authority group is not found
   */
  async findOne(slug: string): Promise<AuthorityGroupResponseDto> {
    const authorityGroup = await this.authorityGroupRepository.findOne({
      where: { slug: slug ?? IsNull() },
    });

    if (!authorityGroup) {
      throw new AuthorityGroupException(
        AuthorityGroupValidation.AUTHORITY_GROUP_NOT_FOUND,
      );
    }

    return this.mapper.map(
      authorityGroup,
      AuthorityGroup,
      AuthorityGroupResponseDto,
    );
  }
}
