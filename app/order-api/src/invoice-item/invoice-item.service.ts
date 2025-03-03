import { Injectable } from '@nestjs/common';

@Injectable()
export class InvoiceItemService {
  create() {
    return 'This action adds a new invoiceItem';
  }

  findAll() {
    return `This action returns all invoiceItem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invoiceItem`;
  }

  update(id: number) {
    return `This action updates a #${id} invoiceItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoiceItem`;
  }
}
