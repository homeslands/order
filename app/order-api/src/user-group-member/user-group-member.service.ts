import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  FindOptionsWhere,
  FindManyOptions,
  Like,
} from 'typeorm';
import { UserGroupMember } from './user-group-member.entity';
import {
  AddUserToGroupDto,
  UserGroupMemberResponseDto,
  BulkAddUsersToGroupDto,
  GetUserGroupMemberQuery,
} from './user-group-member.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { User } from 'src/user/user.entity';
import { UserGroup } from 'src/user-group/user-group.entity';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserException } from 'src/user/user.exception';
import { UserValidation } from 'src/user/user.validation';
import { UserGroupException } from 'src/user-group/user-group.exception';
import { UserGroupValidation } from 'src/user-group/user-group.validation';
import { UserGroupMemberException } from './user-group-member.exception';
import { UserGroupMemberValidation } from './user-group-member.validation';
import { TransactionManagerService } from 'src/db/transaction-manager.service';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import {
  attachCreatedByForArrayEntity,
  attachCreatedByForSingleEntity,
} from 'src/user/user.helper';

@Injectable()
export class UserGroupMemberService {
  constructor(
    @InjectRepository(UserGroupMember)
    private readonly userGroupMemberRepository: Repository<UserGroupMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGroup)
    private readonly userGroupRepository: Repository<UserGroup>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly transactionService: TransactionManagerService,
  ) {}

  async addUserToGroup(
    addUserToGroupDto: AddUserToGroupDto,
    addedById: string,
  ): Promise<UserGroupMemberResponseDto> {
    const context = `${UserGroupMemberService.name}.${this.addUserToGroup.name}`;
    const { user: userSlug, userGroup: userGroupSlug } = addUserToGroupDto;

    // Check if user exists
    const user = await this.userRepository.findOne({
      where: { slug: userSlug },
    });
    if (!user) {
      this.logger.error(`User not found`, context);
      throw new UserException(UserValidation.USER_NOT_FOUND);
    }

    const userGroup = await this.userGroupRepository.findOne({
      where: { slug: userGroupSlug },
    });
    if (!userGroup) {
      this.logger.error(`User group not found`, context);
      throw new UserGroupException(UserGroupValidation.USER_GROUP_NOT_FOUND);
    }

    const existingMember = await this.userGroupMemberRepository.findOne({
      where: { user: { id: user.id }, userGroup: { id: userGroup.id } },
    });

    if (existingMember) {
      this.logger.warn(`User already in group`, context);
      throw new UserGroupMemberException(
        UserGroupMemberValidation.USER_ALREADY_IN_GROUP,
      );
    }

    // Create new member
    const userGroupMember = new UserGroupMember();
    userGroupMember.user = user;
    userGroupMember.userGroup = userGroup;
    userGroupMember.createdBy = addedById;

    const savedMember =
      await this.userGroupMemberRepository.save(userGroupMember);
    return this.mapper.map(
      savedMember,
      UserGroupMember,
      UserGroupMemberResponseDto,
    );
  }

  async bulkAddUsersToGroup(
    bulkAddUsersDto: BulkAddUsersToGroupDto,
    addedById: string,
  ): Promise<void> {
    const context = `${UserGroupMemberService.name}.${this.bulkAddUsersToGroup.name}`;

    const { users: userSlugs, userGroup: userGroupSlug } = bulkAddUsersDto;
    const added: UserGroupMember[] = [];

    // Check if group exists
    const userGroup = await this.userGroupRepository.findOne({
      where: { slug: userGroupSlug },
    });
    if (!userGroup) {
      this.logger.error(`User group not found`, context);
      throw new UserGroupException(UserGroupValidation.USER_GROUP_NOT_FOUND);
    }

    // Get list of users that exist
    const users = await this.userRepository.find({
      where: { slug: In(userSlugs) },
    });

    const foundUserSlugs = users.map((user) => user.slug);

    // Check if members exist
    const existingMembers = await this.userGroupMemberRepository.find({
      where: {
        user: { slug: In(foundUserSlugs) },
        userGroup: { id: userGroup.id },
      },
      relations: ['user'],
    });

    const existingUserSlugs = existingMembers.map((member) => member.user.slug);

    for (const user of users) {
      if (!existingUserSlugs.includes(user.slug)) {
        const user = users.find((m) => m.slug === user.slug);
        const userGroupMember = new UserGroupMember();
        userGroupMember.user = user;
        userGroupMember.userGroup = userGroup;
        userGroupMember.createdBy = addedById;

        added.push(userGroupMember);
      }
    }

    if (added.length > 0) {
      await this.transactionService.execute<void>(
        async (manager) => {
          await manager.save(added);
        },
        () => {
          this.logger.log(`Saved ${added.length} user-group pairs`, context);
        },
        (error) => {
          this.logger.error(
            `Error saving ${added.length} user-group pairs: ${error.message}`,
            context,
          );
        },
      );
    }
  }

  async removeUserFromGroup(slug: string): Promise<void> {
    const context = `${UserGroupMemberService.name}.${this.removeUserFromGroup.name}`;

    const member = await this.userGroupMemberRepository.findOne({
      where: { slug },
      relations: ['user', 'userGroup'],
    });

    if (!member) {
      this.logger.error(`User group member not found`, context);
      throw new UserGroupMemberException(
        UserGroupMemberValidation.USER_GROUP_MEMBER_NOT_FOUND,
      );
    }

    await this.userGroupMemberRepository.softRemove(member);
    this.logger.log(`User group member removed successfully`, context);
  }

  async findAll(
    query: GetUserGroupMemberQuery,
  ): Promise<AppPaginatedResponseDto<UserGroupMemberResponseDto>> {
    // Construct where options
    const whereOptions: FindOptionsWhere<UserGroupMember> = {
      userGroup: {
        slug: query.userGroup,
      },
    };

    // Construct find many options
    const findManyOptions: FindManyOptions = {
      where: whereOptions,
      relations: { user: true, userGroup: true },
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.size,
      take: query.size,
    };

    if (query.phonenumber) {
      findManyOptions.where = {
        ...whereOptions,
        user: {
          phonenumber: Like(`%${query.phonenumber}%`),
        },
      };
    }

    if (query.hasPaging) {
      findManyOptions.skip = (query.page - 1) * query.size;
      findManyOptions.take = query.size;
    }

    // Exec query
    const [userGroupMembers, total] =
      await this.userGroupMemberRepository.findAndCount(findManyOptions);

    // Calculate total pages
    const page = query.hasPaging ? query.page : 1;
    const pageSize = query.hasPaging ? query.size : total;
    const totalPages = Math.ceil(total / pageSize);

    // Determine hasNext and hasPrevious
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const userGroupMembersWithUser = await attachCreatedByForArrayEntity(
      userGroupMembers,
      this.userRepository,
    );

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: this.mapper.mapArray(
        userGroupMembersWithUser,
        UserGroupMember,
        UserGroupMemberResponseDto,
      ),
      total,
      page,
      pageSize,
      totalPages,
    } as AppPaginatedResponseDto<UserGroupMemberResponseDto>;
  }

  async findOne(slug: string): Promise<UserGroupMemberResponseDto> {
    const context = `${UserGroupMemberService.name}.${this.findOne.name}`;
    const member = await this.userGroupMemberRepository.findOne({
      where: { slug },
      relations: ['user', 'userGroup'],
    });

    if (!member) {
      this.logger.warn(`User group member not found`, context);
      throw new UserGroupMemberException(
        UserGroupMemberValidation.USER_GROUP_MEMBER_NOT_FOUND,
      );
    }

    const memberWithUser = await attachCreatedByForSingleEntity(
      member,
      this.userRepository,
    );

    return this.mapper.map(
      memberWithUser,
      UserGroupMember,
      UserGroupMemberResponseDto,
    );
  }
}
