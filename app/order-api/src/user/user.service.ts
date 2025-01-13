import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  In,
  Like,
  Repository,
} from 'typeorm';
import { User } from './user.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  CreateUserRequestDto,
  GetAllUserQueryRequestDto,
  UpdateUserRequestDto,
  UpdateUserRoleRequestDto,
  UserResponseDto,
} from './user.dto';
import { AppPaginatedResponseDto } from 'src/app/app.dto';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/role/role.entity';
import { UserException } from './user.exception';
import { UserValidation } from './user.validation';
import { RoleValidation } from 'src/role/role.validation';
import { RoleException } from 'src/role/role.exception';
import * as _ from 'lodash';
import { BranchValidation } from 'src/branch/branch.validation';
import { BranchException } from 'src/branch/branch.exception';
import { Branch } from 'src/branch/branch.entity';
import { AuthException } from 'src/auth/auth.exception';
import { AuthValidation } from 'src/auth/auth.validation';
import { RoleEnum } from 'src/role/role.enum';

@Injectable()
export class UserService {
  private saltOfRounds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectMapper()
    private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {
    this.saltOfRounds = this.configService.get<number>('SALT_ROUNDS');
  }

  async getUserBySlug(slug: string) {
    const context = `${UserService.name}.${this.getUserBySlug.name}`;
    const user = await this.userRepository.findOne({
      where: {
        slug,
      },
      relations: ['branch', 'role'],
    });

    if (!user) {
      this.logger.error(`User not found`, context);
      throw new UserException(UserValidation.USER_NOT_FOUND);
    }

    return this.mapper.map(user, User, UserResponseDto);
  }

  async updateUser(slug: string, requestData: UpdateUserRequestDto) {
    const context = `${UserService.name}.${this.updateUser.name}`;
    const user = await this.userRepository.findOne({
      where: { slug },
      relations: ['branch', 'role'],
    });
    if (!user) throw new UserException(UserValidation.USER_NOT_FOUND);

    Object.assign(user, {
      ...requestData,
    });

    if (requestData.branch) {
      const branch = await this.branchRepository.findOne({
        where: { slug: requestData.branch },
      });
      if (!branch) {
        this.logger.warn(`Branch ${requestData.branch} not found`, context);
        throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
      }
      user.branch = branch;
    }

    try {
      const updatedUser = await this.userRepository.save(user);
      this.logger.log(`User ${user.id} updated profile`, context);
      return this.mapper.map(updatedUser, User, UserResponseDto);
    } catch (error) {
      this.logger.error(
        `Error when updating user: ${error.message}`,
        error.stack,
        context,
      );
      throw new AuthException(AuthValidation.ERROR_UPDATE_USER);
    }
  }

  async createUser(requestData: CreateUserRequestDto) {
    const context = `${UserService.name}.${this.createUser.name}`;

    // Check if role exists
    const role = await this.roleRepository.findOne({
      where: {
        name: requestData.role,
      },
    });
    if (!role) {
      this.logger.error(`Role is not found`, null, context);
      throw new RoleException(RoleValidation.ROLE_NOT_FOUND);
    }

    // Check phone number uniqueness
    const userExists = await this.userRepository.findOne({
      where: {
        phonenumber: requestData.phonenumber,
      },
    });
    if (userExists) {
      this.logger.error(`User already exists`, null, context);
      throw new AuthException(AuthValidation.USER_EXISTS);
    }

    const user = this.mapper.map(requestData, CreateUserRequestDto, User);

    const hashedPass = await bcrypt.hash(
      requestData.password,
      this.saltOfRounds,
    );
    Object.assign(user, {
      password: hashedPass,
      role,
    });

    if (requestData.branch) {
      const branch = await this.branchRepository.findOne({
        where: {
          slug: requestData.branch,
        },
      });
      if (!branch) throw new BranchException(BranchValidation.BRANCH_NOT_FOUND);
      user.branch = branch;
    }

    try {
      await this.userRepository.save(user);
      this.logger.log(`User has been created successfully`, context);
    } catch (error) {
      this.logger.error(
        `Error when creating user: ${error.message}`,
        error.stack,
        context,
      );
      throw new UserException(UserValidation.ERROR_CREATE_USER);
    }

    return this.mapper.map(user, User, UserResponseDto);
  }

  async updateUserRole(slug: string, requestData: UpdateUserRoleRequestDto) {
    const context = `${UserService.name}.${this.updateUserRole.name}`;
    const role = await this.roleRepository.findOne({
      where: {
        slug: requestData.role,
      },
    });
    if (!role) throw new RoleException(RoleValidation.ROLE_NOT_FOUND);

    const user = await this.userRepository.findOne({
      where: { slug },
      relations: ['role'],
    });
    if (!user) throw new UserException(UserValidation.USER_NOT_FOUND);

    if (user.role.name === RoleEnum.Customer) {
      this.logger.warn(
        `Can not update customer role to ${role.name} role`,
        context,
      );
      throw new UserException(UserValidation.CANNOT_UPDATE_CUSTOMER_ROLE);
    }

    try {
      user.role = role;
      await this.userRepository.save(user);
      this.logger.log(`User role has been updated successfully`, context);
    } catch (error) {
      this.logger.error(
        `Error when updating user role: ${error.message}`,
        error.stack,
        context,
      );
    }

    return this.mapper.map(user, User, UserResponseDto);
  }

  async resetPassword(slug: string) {
    const context = `${UserService.name}.${this.resetPassword.name}`;
    const user = await this.userRepository.findOne({
      where: { slug },
    });
    if (!user) throw new UserException(UserValidation.USER_NOT_FOUND);

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPass = await bcrypt.hash(newPassword, this.saltOfRounds);

    user.password = hashedPass;
    await this.userRepository.save(user);
    this.logger.log(`User password reset for ${user.email}`, context);

    this.mailService.sendNewPassword(user, newPassword);
  }

  async getAllUsers(
    query: GetAllUserQueryRequestDto,
  ): Promise<AppPaginatedResponseDto<UserResponseDto>> {
    // Construct where options
    const whereOptions: FindOptionsWhere<User> = {};
    if (query.branch) whereOptions.branch = { slug: query.branch };
    if (query.phonenumber)
      whereOptions.phonenumber = Like(`%${query.phonenumber}%`);
    if (!_.isEmpty(query.role))
      whereOptions.role = {
        name: In(query.role),
      };

    // Construct find many options
    const findManyOptions: FindManyOptions = {
      relations: ['branch', 'role'],
      where: whereOptions,
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.size,
      take: query.size,
    };
    if (query.hasPaging) {
      findManyOptions.skip = (query.page - 1) * query.size;
      findManyOptions.take = query.size;
    }

    // Exec query
    const [users, total] =
      await this.userRepository.findAndCount(findManyOptions);

    // Calculate total pages
    const page = query.hasPaging ? query.page : 1;
    const pageSize = query.hasPaging ? query.size : total;
    const totalPages = Math.ceil(total / pageSize);

    // Determine hasNext and hasPrevious
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      hasNext: hasNext,
      hasPrevios: hasPrevious,
      items: this.mapper.mapArray(users, User, UserResponseDto),
      total,
      page,
      pageSize,
      totalPages,
    } as AppPaginatedResponseDto<UserResponseDto>;
  }
}
