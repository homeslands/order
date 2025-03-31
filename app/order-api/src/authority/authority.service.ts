import { Inject, Injectable, Logger } from '@nestjs/common';
import { Authority } from './authority.entity';
import { AuthorityResponseDto, UpdateAuthorityDto } from './authority.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { AuthorityException } from './authority.exception';
import { AuthorityValidation } from './authority.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TransactionManagerService } from 'src/db/transaction-manager.service';

@Injectable()
export class AuthorityService {
  constructor(
    @InjectRepository(Authority)
    private readonly authorityRepository: Repository<Authority>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionManagerService: TransactionManagerService,
  ) {}

  /**
   * Get all authorities
   * @returns {Promise<AuthorityResponseDto[]>} List of authorities
   */
  async findAll(): Promise<AuthorityResponseDto[]> {
    const authorities = await this.authorityRepository.find({
      order: {
        authorityGroup: {
          createdAt: 'DESC',
        },
        createdAt: 'DESC',
      },
    });
    return this.mapper.mapArray(authorities, Authority, AuthorityResponseDto);
  }

  /**
   * Get an authority by slug
   * @param slug - The slug of the authority
   * @returns {Promise<AuthorityResponseDto>} The authority
   */
  async findOne(slug: string): Promise<AuthorityResponseDto> {
    const authority = await this.authorityRepository.findOne({
      where: { slug: slug ?? IsNull() },
    });
    if (!authority) {
      throw new AuthorityException(AuthorityValidation.AUTHORITY_NOT_FOUND);
    }

    return this.mapper.map(authority, Authority, AuthorityResponseDto);
  }

  /**
   * Update an authority
   * @param slug - The slug of the authority
   * @param updateAuthorityDto - The update authority dto
   * @returns {Promise<AuthorityResponseDto>} The updated authority
   * @throws {AuthorityException} If the authority is not found
   */
  async update(
    slug: string,
    updateAuthorityDto: UpdateAuthorityDto,
  ): Promise<AuthorityResponseDto> {
    const context = `${AuthorityService.name}.${this.update.name}`;

    const authority = await this.authorityRepository.findOne({
      where: { slug: slug ?? IsNull() },
    });
    if (!authority) {
      throw new AuthorityException(AuthorityValidation.AUTHORITY_NOT_FOUND);
    }

    const previousAuthority = `${authority.name} - ${authority.code}`;

    Object.assign(authority, updateAuthorityDto);

    const updatedAuthority =
      await this.transactionManagerService.execute<Authority>(
        async (manager) => {
          return manager.save(authority);
        },
        (result) => {
          this.logger.log(
            `Authority updated: ${previousAuthority} -> ${result.name} - ${result.code}`,
            context,
          );
        },
        (error) => {
          this.logger.error(
            `Error updating authority: ${previousAuthority} -> ${error.message}`,
            context,
          );
          throw new AuthorityException(
            AuthorityValidation.AUTHORITY_UPDATE_FAILED,
            error.message,
          );
        },
      );

    return this.mapper.map(updatedAuthority, Authority, AuthorityResponseDto);
  }

  /**
   * Delete an authority
   * @param slug - The slug of the authority
   * @returns {Promise<AuthorityResponseDto>} The deleted authority
   * @throws {AuthorityException} If the authority is not found
   */
  async delete(slug: string): Promise<AuthorityResponseDto> {
    const context = `${AuthorityService.name}.${this.delete.name}`;
    const authority = await this.authorityRepository.findOne({
      where: { slug: slug ?? IsNull() },
    });
    if (!authority) {
      throw new AuthorityException(AuthorityValidation.AUTHORITY_NOT_FOUND);
    }

    await this.transactionManagerService.execute<Authority>(
      async (manager) => {
        return manager.remove(authority);
      },
      (result) => {
        this.logger.log(
          `Authority deleted: ${result.name} - ${result.code}`,
          context,
        );
      },
      (error) => {
        this.logger.error(
          `Error deleting authority: ${error.message}`,
          error.stack,
          context,
        );
        throw new AuthorityException(
          AuthorityValidation.AUTHORITY_DELETE_FAILED,
          error.message,
        );
      },
    );

    return this.mapper.map(authority, Authority, AuthorityResponseDto);
  }
}
