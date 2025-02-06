import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Menu } from './menu.entity';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { getDayIndex } from 'src/helper';

@EventSubscriber()
export class MenuSubscriber implements EntitySubscriberInterface<Menu> {
  constructor(
    dataSource: DataSource,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Menu;
  }

  beforeInsert(event: InsertEvent<Menu>) {
    const targetDate = event.entity.date;
    const dayIndex = getDayIndex(targetDate);
    event.entity.dayIndex = dayIndex;
  }
}
