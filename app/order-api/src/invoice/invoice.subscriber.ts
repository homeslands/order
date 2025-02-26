import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
import { Invoice } from './invoice.entity';

@EventSubscriber()
export class InvoiceSubscriber implements EntitySubscriberInterface<Invoice> {
  listenTo() {
    return Invoice;
  }

  //   Insert invoice item
  // afterInsert(event: InsertEvent<Invoice>): Promise<any> | void {}
}
