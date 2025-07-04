import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ChefOrderItem } from 'src/chef-order-item/chef-order-item.entity';
import { PrinterJobType, PrinterType } from './printer.constants';
import { ChefOrder } from 'src/chef-order/chef-order.entity';
import { createCanvas } from 'canvas';
import { PrinterProducer } from './printer.producer';
import moment from 'moment';
import { PrinterManager } from './printer.manager';

@Injectable()
export class PrinterUtils {
  constructor(
    private readonly printerManager: PrinterManager,
    private readonly printerProducer: PrinterProducer,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async printChefOrderItemTicket(
    printerIp: string,
    printerPort: string,
    bitmapDataList: Buffer[],
  ) {
    this.printerProducer.createPrintJob({
      jobType: PrinterJobType.LABEL_TICKET,
      printerIp,
      printerPort,
      bitmapDataList,
    });
  }

  async handlePrintChefOrderItemTicket(
    printerIp: string,
    printerPort: string,
    bitmapDataList: Buffer[],
  ) {
    const context = `${PrinterUtils.name}.${this.handlePrintChefOrderItemTicket.name}`;
    const buffersToSend = this.createTsplChefOrderItemTicket(bitmapDataList);

    try {
      const socket = this.printerManager.getOrCreateConnection(
        printerIp,
        printerPort,
        PrinterType.RAW,
      );

      for (const buffer of buffersToSend) {
        await socket.send(buffer);
      }
    } catch (error) {
      this.logger.error(`Error printing ticket`, error.stack, context);
    } finally {
      this.logger.log(
        `Sent ${buffersToSend.length} buffers for ${bitmapDataList.length} labels`,
        context,
      );
    }
  }

  createTsplChefOrderItemTicket(bitmapDataList: Buffer[]): Buffer[] {
    const buffers: Buffer[] = [];

    for (const bitmap of bitmapDataList) {
      const header = Buffer.from(
        `SIZE 50 mm,30 mm\nGAP 2 mm,0 mm\nCLS\n`,
        'ascii',
      );
      const bitmapCmd = Buffer.from(`BITMAP 0,0,72,384,0,\n`, 'ascii');
      const printCmd = Buffer.from(`\nPRINT 1,1\n`, 'ascii');

      buffers.push(Buffer.concat([header, bitmapCmd, bitmap, printCmd]));
    }

    return buffers;
  }

  async printChefOrder(
    printerIp: string,
    printerPort: string,
    chefOrder: ChefOrder,
  ) {
    this.printerProducer.createPrintJob({
      jobType: PrinterJobType.CHEF_ORDER,
      printerIp,
      printerPort,
      chefOrder,
    });
  }

  async handlePrintChefOrder(
    printerIp: string,
    printerPort: string,
    chefOrder: ChefOrder,
  ) {
    const context = `${PrinterUtils.name}.${this.handlePrintChefOrder.name}`;
    const buffersToSend = await this.createChefOrderEscPosBufferByCanvas(
      chefOrder.order?.referenceNumber.toString() ?? 'N/A',
      chefOrder.order?.branch?.name ?? 'N/A',
      chefOrder.order?.table?.name ?? 'Mang đi',
      moment(chefOrder.order?.createdAt).format('DD/MM/YYYY HH:mm:ss'),
      chefOrder.order?.description ?? 'N/A',
      chefOrder.chefOrderItems,
    );
    try {
      const socket = this.printerManager.getOrCreateConnection(
        printerIp,
        printerPort,
        PrinterType.ESC_POS,
      );

      await socket.send(buffersToSend);
    } catch (error) {
      this.logger.error(`Error printing chef order`, error.stack, context);
    } finally {
      this.logger.log(
        `Sent ${buffersToSend.length} chef order buffer for printer ${printerIp}:${printerPort}`,
        context,
      );
    }
  }

  async createChefOrderEscPosBufferByCanvas(
    orderCode: string,
    branchName: string,
    table: string,
    createdAt: string,
    noteAll: string,
    chefOrderItems: ChefOrderItem[],
  ): Promise<Buffer> {
    const canvasWidth = 576;
    const lineHeight = 36;
    const padding = 20;

    // Prepare temp context to calculate text wrapping
    const tempCanvas = createCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = '24px Roboto';

    const headerWidths = [0.4, 0.2, 0.1, 0.3];
    const canvasWidthEstimated = 576;

    // Estimate wrapped lines for product rows
    const totalWrappedLines = chefOrderItems.reduce((sum, item) => {
      const values = [
        item.orderItem.variant.product.name,
        item.orderItem.variant.size.name.toUpperCase(),
        item.defaultQuantity.toString(),
        item.orderItem.note || '',
      ];

      const wrapped = values.map((v, i) => {
        const colWidth = headerWidths[i] * canvasWidthEstimated;
        return this.wrapText(tempCtx, v, colWidth - 10).length;
      });

      return sum + Math.max(...wrapped);
    }, 0);

    // Estimate lines for header info (branchName, createdAt, table, noteAll)
    const infoFields = [
      branchName,
      createdAt,
      table,
      noteAll || 'Không có ghi chú',
    ];
    const infoWrappedLines = infoFields.reduce((sum, field) => {
      return (
        sum + this.wrapText(tempCtx, field, canvasWidth - 2 * padding).length
      );
    }, 0);

    const fixedHeaderHeight = 180 + infoWrappedLines * lineHeight; // base + wrapped info lines
    const canvasHeight =
      fixedHeaderHeight + totalWrappedLines * lineHeight + 100;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 30px Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('TREND COFFEE', canvasWidth / 2, 40);
    ctx.font = '24px Roboto';
    ctx.fillText(`Mã đơn: ${orderCode}`, canvasWidth / 2, 80);

    // Info section (Chi nhánh, Thời gian, Bàn, Ghi chú)
    ctx.textAlign = 'left';
    let currentY = 120;
    const infoData = [
      `Chi nhánh: ${branchName}`,
      `Thời gian: ${createdAt}`,
      `Bàn: ${table}`,
      `Ghi chú: ${noteAll || 'Không có ghi chú'}`,
    ];

    infoData.forEach((text) => {
      const lines = this.wrapText(ctx, text, canvasWidth - 2 * padding);
      lines.forEach((line) => {
        ctx.fillText(line, padding, currentY);
        currentY += lineHeight;
      });
    });

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(padding, currentY);
    ctx.lineTo(canvasWidth - padding, currentY);
    ctx.stroke();
    currentY += 30;

    // Table headers
    const headers = ['Món', 'Size', 'SL', 'Ghi chú'];
    const headerX = headerWidths.map(
      (_, i) =>
        headerWidths.slice(0, i).reduce((sum, w) => sum + w, 0) * canvasWidth,
    );

    ctx.font = 'bold 24px Roboto';
    headers.forEach((h, i) => {
      ctx.fillText(h, headerX[i] + 5, currentY);
    });
    currentY += lineHeight;

    // Product lines
    ctx.font = '24px Roboto';

    chefOrderItems.forEach((item) => {
      const values = [
        item.orderItem.variant.product.name,
        item.orderItem.variant.size.name.toUpperCase(),
        item.defaultQuantity.toString(),
        item.orderItem.note || '',
      ];

      const wrappedLines = values.map((v, i) => {
        const colWidth = headerWidths[i] * canvasWidth;
        return this.wrapText(ctx, v, colWidth - 10);
      });

      const maxLines = Math.max(...wrappedLines.map((lines) => lines.length));

      for (let line = 0; line < maxLines; line++) {
        wrappedLines.forEach((lines, i) => {
          const text = lines[line] || '';
          ctx.fillText(text, headerX[i] + 5, currentY);
        });
        currentY += lineHeight;
      }
    });

    return canvas.toBuffer('image/png');
  }

  wrapText(ctx: any, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = ctx.measureText(testLine).width;
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
