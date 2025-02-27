import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Repository,
  Table,
} from 'typeorm';
import { Order } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TableStatus } from 'src/table/table.constant';
import { Menu } from 'src/menu/menu.entity';
import { Variant } from 'src/variant/variant.entity';
import { MenuItem } from 'src/menu-item/menu-item.entity';

@EventSubscriber()
export class OrderSubscriber implements EntitySubscriberInterface<Order> {
  constructor(
    dataSource: DataSource,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Variant)
    private readonly variantRepository: Repository<Variant>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Order;
  }

  //   Update table status after created order
  async afterInsert(event: InsertEvent<Order>) {
    this.updateTableStatus(event.entity);
  }

  async updateTableStatus(entity: Order) {
    const context = `${OrderSubscriber.name}.${this.updateTableStatus.name}`;
    this.logger.log(`Update table status for order: ${entity.slug}`, context);

    const { table } = entity;
    if (!table) {
      this.logger.warn(`Table not found`, context);
      return;
    }

    if (table?.status === TableStatus.AVAILABLE) {
      table.status = TableStatus.RESERVED;
      await this.tableRepository.save(table);
      this.logger.log(
        `Table status ${table.name} updated successfully`,
        context,
      );
    }
  }
}
