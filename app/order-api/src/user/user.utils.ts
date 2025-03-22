import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from './user.entity';
import { UserException } from './user.exception';
import { UserValidation } from './user.validation';

@Injectable()
export class UserUtils {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUser(opts: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepository.findOne({ ...opts });
    if (!user) throw new UserException(UserValidation.USER_NOT_FOUND);
    return user;
  }
}
