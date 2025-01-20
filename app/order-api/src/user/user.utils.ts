import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthException } from 'src/auth/auth.exception';
import { UserException } from './user.exception';
import { UserValidation } from './user.validation';

@Injectable()
export class UserUtils {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUser(where: FindOptionsWhere<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where });
    if (!user) throw new UserException(UserValidation.USER_NOT_FOUND);
    return user;
  }
}
