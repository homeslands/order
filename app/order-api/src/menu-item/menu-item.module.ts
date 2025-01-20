import { Module } from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { MenuItemController } from './menu-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './menu-item.entity';
import { MenuItemProfile } from './menu-item.mapper';
import { Menu } from 'src/menu/menu.entity';
import { Product } from 'src/product/product.entity';
import { Catalog } from 'src/catalog/catalog.entity';
import { MenuItemUtils } from './menu-item.utils';
import { MenuModule } from 'src/menu/menu.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem, Menu, Product, Catalog]),
    MenuModule,
  ],
  controllers: [MenuItemController],
  providers: [MenuItemService, MenuItemProfile, MenuItemUtils],
  exports: [MenuItemService, MenuItemUtils],
})
export class MenuItemModule {}
