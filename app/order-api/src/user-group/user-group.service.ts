import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { UserGroup } from './user-group.entity';
import {
  CreateUserGroupDto,
  UpdateUserGroupDto,
  GetAllUserGroupQueryRequestDto,
} from './user-group.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { UserGroupResponseDto } from './user-group.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserGroupException } from './user-group.exception';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { UserGroupValidation } from './user-group.validation';
import { User } from 'src/user/user.entity';
import {
  attachCreatedByForArrayEntity,
  attachCreatedByForSingleEntity,
} from 'src/user/user.helper';

@Injectable()
export class UserGroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async create(
    createUserGroupDto: CreateUserGroupDto,
    userId: string,
  ): Promise<UserGroupResponseDto> {
    const context = `${UserGroupService.name}.${this.create.name}`;
    const existingGroup = await this.userGroupRepository.findOne({
      where: { name: createUserGroupDto.name },
    });

    if (existingGroup) {
      this.logger.warn(`User group already exists`, context);
      throw new UserGroupException(
        UserGroupValidation.USER_GROUP_ALREADY_EXISTS,
      );
    }

    const userGroup = this.userGroupRepository.create({
      ...createUserGroupDto,
      createdBy: userId,
    });

    const savedUserGroup = await this.userGroupRepository.save(userGroup);
    return this.mapper.map(savedUserGroup, UserGroup, UserGroupResponseDto);
  }

  async getAllUserGroups(
    query: GetAllUserGroupQueryRequestDto,
  ): Promise<AppPaginatedResponseDto<UserGroupResponseDto>> {
    // Construct where options
    const whereOptions: FindOptionsWhere<UserGroup> = {};

    // Construct find many options
    const findManyOptions: FindManyOptions<UserGroup> = {
      where: whereOptions,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.size,
      take: query.size,
    };

    // Add name condition if provided
    if (query.name) {
      findManyOptions.where = {
        ...whereOptions,
        name: Like(`%${query.name}%`),
      };
    }
    if (query.phoneNumber) {
      findManyOptions.where = {
        ...whereOptions,
        userGroupMembers: {
          user: { phonenumber: query.phoneNumber },
        },
      };
    }

    if (query.hasPaging) {
      findManyOptions.skip = (query.page - 1) * query.size;
      findManyOptions.take = query.size;
    }

    // Exec query
    const [userGroups, total] =
      await this.userGroupRepository.findAndCount(findManyOptions);

    // Calculate total pages
    const page = query.hasPaging ? query.page : 1;
    const pageSize = query.hasPaging ? query.size : total;
    const totalPages = Math.ceil(total / pageSize);

    // Determine hasNext and hasPrevious
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const groupsWithUser = await attachCreatedByForArrayEntity(
      userGroups,
      this.userRepository,
    );

    const userGroupsDto = this.mapper.mapArray(
      groupsWithUser,
      UserGroup,
      UserGroupResponseDto,
    );

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: userGroupsDto,
      total,
      page,
      pageSize,
      totalPages,
    } as AppPaginatedResponseDto<UserGroupResponseDto>;
  }

  async findOne(slug: string): Promise<UserGroupResponseDto> {
    const context = `${UserGroupService.name}.${this.findOne.name}`;
    const userGroup = await this.userGroupRepository.findOne({
      where: { slug },
      relations: ['userGroupMembers', 'userGroupMembers.user'],
    });

    if (!userGroup) {
      this.logger.error(`User group not found`, context);
      throw new UserGroupException(UserGroupValidation.USER_GROUP_NOT_FOUND);
    }

    const userGroupWithUser = await attachCreatedByForSingleEntity(
      userGroup,
      this.userRepository,
    );

    return this.mapper.map(userGroupWithUser, UserGroup, UserGroupResponseDto);
  }

  async update(
    slug: string,
    updateUserGroupDto: UpdateUserGroupDto,
  ): Promise<UserGroupResponseDto> {
    const context = `${UserGroupService.name}.${this.update.name}`;
    const userGroup = await this.userGroupRepository.findOne({
      where: { slug },
    });

    if (!userGroup) {
      this.logger.error(`User group not found`, context);
      throw new UserGroupException(UserGroupValidation.USER_GROUP_NOT_FOUND);
    }

    if (updateUserGroupDto.name && updateUserGroupDto.name !== userGroup.name) {
      const existingGroup = await this.userGroupRepository.findOne({
        where: { name: updateUserGroupDto.name },
      });

      if (existingGroup) {
        this.logger.warn(`User group already exists`, context);
        throw new UserGroupException(
          UserGroupValidation.USER_GROUP_NAME_ALREADY_EXISTS,
        );
      }
    }

    Object.assign(userGroup, updateUserGroupDto);
    const updatedUserGroup = await this.userGroupRepository.save(userGroup);
    this.logger.log(`User group updated successfully`, context);

    return this.mapper.map(updatedUserGroup, UserGroup, UserGroupResponseDto);
  }

  async remove(slug: string): Promise<void> {
    const context = `${UserGroupService.name}.${this.remove.name}`;
    const userGroup = await this.userGroupRepository.findOne({
      where: { slug },
    });

    if (!userGroup) {
      this.logger.error(`User group not found`, context);
      throw new UserGroupException(UserGroupValidation.USER_GROUP_NOT_FOUND);
    }

    await this.userGroupRepository.softRemove(userGroup);
    this.logger.log(`User group removed successfully`, context);
  }

  // async getStatistics(): Promise<{
  //   totalGroups: number;
  //   activeGroups: number;
  //   inactiveGroups: number;
  // }> {
  //   const [totalGroups, activeGroups] = await Promise.all([
  //     this.userGroupRepository.count(),
  //     this.userGroupRepository.count({ where: { isActive: true } }),
  //   ]);

  //   return {
  //     totalGroups,
  //     activeGroups,
  //     inactiveGroups: totalGroups - activeGroups,
  //   };
  // }
}
