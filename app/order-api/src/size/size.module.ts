import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SizeController } from './size.controller';
import { SizeService } from './size.service';
import { Size } from './size.entity';
import { SizeProfile } from './size.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Size])],
  controllers: [SizeController],
  providers: [SizeService, SizeProfile],
  exports: [SizeService],
})
export class SizeModule {}
