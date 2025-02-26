import { Controller } from '@nestjs/common';
import { InvoiceItemService } from './invoice-item.service';

@Controller('invoice-item')
export class InvoiceItemController {
  constructor(private readonly invoiceItemService: InvoiceItemService) {}
}
