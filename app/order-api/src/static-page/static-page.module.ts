import { Module } from '@nestjs/common';
import { StaticPage } from './static-page.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaticPageController } from './static-page.controller';
import { StaticPageService } from './static-page.service';
import { StaticPageProfile } from './static-page.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([StaticPage])],
  controllers: [StaticPageController],
  providers: [StaticPageService, StaticPageProfile],
})
export class StaticPageModule {}
