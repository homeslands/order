import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserProfile } from './user.mapper';
import { MailModule } from 'src/mail/mail.module';
import { UserScheduler } from './user.scheduler';
import { Role } from 'src/role/role.entity';
import { Branch } from 'src/branch/branch.entity';
import { UserUtils } from './user.utils';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Branch]), MailModule, SharedModule],
  controllers: [UserController],
  providers: [UserService, UserProfile, UserScheduler, UserUtils],
  exports: [UserService, UserUtils],
})
export class UserModule { }
