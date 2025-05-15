import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RoleScheduler } from './role.scheduler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { RoleProfile } from './role.mapper';
import { DbModule } from 'src/db/db.module';
import { Authority } from 'src/authority/authority.entity';
import { Permission } from 'src/permission/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Authority, Permission]), DbModule],
  controllers: [RoleController],
  providers: [RoleService, RoleScheduler, RoleProfile],
})
export class RoleModule {}
