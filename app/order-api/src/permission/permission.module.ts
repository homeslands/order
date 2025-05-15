import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbModule } from 'src/db/db.module';
import { Authority } from 'src/authority/authority.entity';
import { Role } from 'src/role/role.entity';
import { Permission } from './permission.entity';
import { PermissionProfile } from './permission.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Authority, Role]), DbModule],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionProfile],
})
export class PermissionModule {}
