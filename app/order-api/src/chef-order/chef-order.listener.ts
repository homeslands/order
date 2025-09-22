import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { OnEvent } from '@nestjs/event-emitter';
import { ChefOrderAction } from './chef-order.constants';
import { ChefOrderUtils } from './chef-order.utils';
import { PrinterUtils } from 'src/printer/printer.utils';
import { PdfService } from 'src/pdf/pdf.service';
import sharp from 'sharp';
import {
  ModePrinter,
  PrinterDataType,
  PrinterJobType,
} from 'src/printer/printer.constants';
import _ from 'lodash';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { SystemConfigKey } from 'src/system-config/system-config.constant';

@Injectable()
export class ChefOrderListener {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly chefOrderUtils: ChefOrderUtils,
    private readonly printerUtils: PrinterUtils,
    private readonly pdfService: PdfService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async getModePrinter() {
    return (
      (await this.systemConfigService.get(SystemConfigKey.MODE_PRINTER)) ||
      ModePrinter.REDIS
    );
  }

  @OnEvent(ChefOrderAction.CHEF_ORDER_CREATED)
  async handleAutoPrintCreatedChefOrder(requestData: { chefOrderId: string }) {
    this.logger.log(
      `Start handle auto print created chef order: ${requestData.chefOrderId}`,
    );

    const modePrinter = await this.getModePrinter();

    const chefOrder = await this.chefOrderUtils.getChefOrder({
      where: { id: requestData.chefOrderId },
      relations: [
        'chefOrderItems.orderItem.variant.size',
        'chefOrderItems.orderItem.variant.product',
        'order.table',
        'order.branch',
        'chefArea.printers',
        'order.deliveryTo',
      ],
    });

    const printers = chefOrder.chefArea.printers;
    const tsplZplPrinters = printers.filter(
      (printer) =>
        printer.dataType === PrinterDataType.TSPL_ZPL && printer.isActive,
    );
    const escPosPrinters = printers.filter(
      (printer) =>
        printer.dataType === PrinterDataType.ESC_POS && printer.isActive,
    );

    if (_.size(tsplZplPrinters) > 0) {
      if (modePrinter === ModePrinter.REDIS) {
        const bitmapDataList: Buffer[] = [];
        for (const chefOrderItem of chefOrder.chefOrderItems) {
          let data = await this.pdfService.generatePdfImage(
            'chef-order-item-ticket-image',
            {
              productName:
                chefOrderItem?.orderItem?.variant?.product?.name ?? 'N/A',
              referenceNumber: chefOrder?.order?.referenceNumber ?? 'N/A',
              note: chefOrderItem?.orderItem?.note ?? 'N/A',
              variantName:
                chefOrderItem?.orderItem?.variant?.size?.name ?? 'N/A',
              createdAt: chefOrder?.order?.createdAt ?? 'N/A',
            },
            {
              type: 'png',
              omitBackground: false,
            },
          );
          const bitmapData = await this.convertImageToBitmap(data);
          data = null;
          bitmapDataList.push(bitmapData);
        }

        // await Promise.allSettled(
        //   tsplZplPrinters.map((printer) =>
        //     this.printerUtils.printChefOrderItemTicket(
        //       printer.ip,
        //       printer.port,
        //       bitmapDataList,
        //     ),
        //   ),
        // );

        await Promise.allSettled(
          tsplZplPrinters.flatMap((printer) =>
            Array.from({ length: printer.numberPrinting ?? 1 }, () =>
              this.printerUtils.printChefOrderItemTicket(
                printer.ip,
                printer.port,
                bitmapDataList,
              ),
            ),
          ),
        );
      } else if (modePrinter === ModePrinter.DATABASE) {
        // await Promise.allSettled(
        //   tsplZplPrinters.map((printer) =>
        //     this.printerUtils.createPrintJob(
        //       PrinterJobType.LABEL_TICKET,
        //       chefOrder.id,
        //       printer.ip,
        //       printer.port,
        //     ),
        //   ),
        // );

        await Promise.allSettled(
          tsplZplPrinters.flatMap((printer) =>
            Array.from({ length: printer.numberPrinting ?? 1 }, () =>
              this.printerUtils.createPrintJob(
                PrinterJobType.LABEL_TICKET,
                chefOrder.id,
                printer.ip,
                printer.port,
              ),
            ),
          ),
        );
      }
    } else {
      this.logger.warn(
        `No active raw printer found for chef order: ${requestData.chefOrderId}`,
      );
    }

    if (_.size(escPosPrinters) > 0) {
      if (modePrinter === ModePrinter.REDIS) {
        // await Promise.allSettled(
        //   escPosPrinters.map((printer) =>
        //     this.printerUtils.printChefOrder(
        //       printer.ip,
        //       printer.port,
        //       chefOrder,
        //     ),
        //   ),
        // );

        await Promise.allSettled(
          escPosPrinters.flatMap((printer) =>
            Array.from({ length: printer.numberPrinting ?? 1 }, () =>
              this.printerUtils.printChefOrder(
                printer.ip,
                printer.port,
                chefOrder,
              ),
            ),
          ),
        );
      } else if (modePrinter === ModePrinter.DATABASE) {
        // await Promise.allSettled(
        //   escPosPrinters.map((printer) =>
        //     this.printerUtils.createPrintJob(
        //       PrinterJobType.CHEF_ORDER,
        //       chefOrder.id,
        //       printer.ip,
        //       printer.port,
        //     ),
        //   ),
        // );

        await Promise.allSettled(
          escPosPrinters.flatMap((printer) =>
            Array.from({ length: printer.numberPrinting ?? 1 }, () =>
              this.printerUtils.createPrintJob(
                PrinterJobType.CHEF_ORDER,
                chefOrder.id,
                printer.ip,
                printer.port,
              ),
            ),
          ),
        );
      }
    } else {
      this.logger.warn(
        `No active esc pos printer found for chef order: ${requestData.chefOrderId}`,
      );
    }
  }

  async convertImageToBitmap(imageBuffer: Buffer): Promise<Buffer> {
    const width = 576;
    const height = 384;
    const data = await sharp(imageBuffer)
      .resize(width, height)
      .grayscale()
      .negate()
      .threshold(128)
      .raw()
      .toBuffer();

    const bytesPerRow = Math.ceil(width / 8);
    const bitmapData = Buffer.alloc(bytesPerRow * height);

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const pixelIndex = i * width + j;
        const pixel = data[pixelIndex];

        if (pixel === 0) {
          bitmapData[i * bytesPerRow + (j >> 3)] |= 0x80 >> j % 8;
        }
      }
    }

    return bitmapData;
  }
}
