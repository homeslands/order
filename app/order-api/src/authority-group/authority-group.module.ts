import { Module } from '@nestjs/common';
import { AuthorityGroupService } from './authority-group.service';
import { AuthorityGroupController } from './authority-group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorityGroup } from './authority-group.entity';
import { AuthorityGroupProfile } from './authority-group.mapper';
import { DbModule } from 'src/db/db.module';
import { Permission } from 'src/permission/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthorityGroup, Permission]), DbModule],
  controllers: [AuthorityGroupController],
  providers: [AuthorityGroupService, AuthorityGroupProfile],
})
export class AuthorityGroupModule {}
