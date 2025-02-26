import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Catalog } from './catalog.entity';
import { CatalogProfile } from './catalog.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Catalog])],
  controllers: [CatalogController],
  providers: [CatalogService, CatalogProfile],
  exports: [CatalogService],
})
export class CatalogModule {}
