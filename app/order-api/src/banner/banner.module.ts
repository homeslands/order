import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './banner.entity';
import { BannerProfile } from './banner.mapper';
import { BannerUtils } from './banner.utils';
import { FileService } from 'src/file/file.service';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Banner]),
    FileModule
  ],
  controllers: [BannerController],
  providers: [BannerService, BannerProfile, BannerUtils],
})
export class BannerModule {}
