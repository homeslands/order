import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroupMemberService } from './user-group-member.service';
import { UserGroupMemberController } from './user-group-member.controller';
import { UserGroupMemberProfile } from './user-group-member.mapper';
import { User } from 'src/user/user.entity';
import { UserGroup } from 'src/user-group/user-group.entity';
import { UserGroupMember } from './user-group-member.entity';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserGroupMember, User, UserGroup]),
    DbModule,
  ],
  controllers: [UserGroupMemberController],
  providers: [UserGroupMemberService, UserGroupMemberProfile],
  exports: [UserGroupMemberService],
})
export class UserGroupMemberModule {}
