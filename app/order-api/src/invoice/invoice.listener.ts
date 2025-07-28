import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { InvoiceService } from './invoice.service';
import { InvoiceAction } from './invoice.constants';
import { OnEvent } from '@nestjs/event-emitter';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { ModePrinter, PrinterJobType } from 'src/printer/printer.constants';
import { SystemConfigKey } from 'src/system-config/system-config.constant';
import { Order } from 'src/order/order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PrinterUtils } from 'src/printer/printer.utils';
import _ from 'lodash';

@Injectable()
export class InvoiceListener {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly invoiceService: InvoiceService,
    private readonly systemConfigService: SystemConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly printerUtils: PrinterUtils,
  ) {}

  async getModePrinter() {
    return (
      (await this.systemConfigService.get(SystemConfigKey.MODE_PRINTER)) ||
      ModePrinter.REDIS
    );
  }

  @OnEvent(InvoiceAction.INVOICE_CREATED)
  async handleInvoiceCreated(requestData: { orderId: string }) {
    this.logger.log(`Start handle invoice created: ${requestData.orderId}`);

    const modePrinter = await this.getModePrinter();

    const order = await this.orderRepository.findOne({
      where: { id: requestData.orderId },
      relations: ['branch.invoiceAreas.printers'],
    });

    if (!order) {
      this.logger.error(
        `Order not found when handle invoice created: ${requestData.orderId}`,
      );
      return;
    }

    const printers = _.flatten(
      order?.branch.invoiceAreas.map((invoiceArea) =>
        invoiceArea.printers.filter((printer) => printer.isActive),
      ) ?? [],
    );

    if (modePrinter === ModePrinter.REDIS) {
      await Promise.allSettled(
        printers.flatMap((printer) =>
          Array.from({ length: printer.numberPrinting ?? 1 }, () =>
            this.printerUtils.printInvoice(
              printer.ip,
              printer.port,
              order.slug,
            ),
          ),
        ),
      );
    } else if (modePrinter === ModePrinter.DATABASE) {
      await Promise.allSettled(
        printers.flatMap((printer) =>
          Array.from({ length: printer.numberPrinting ?? 1 }, () =>
            this.printerUtils.createPrintJob(
              PrinterJobType.INVOICE,
              order.id,
              printer.ip,
              printer.port,
            ),
          ),
        ),
      );
    }
  }
}
