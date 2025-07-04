import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueueRegisterKey } from 'src/app/app.constants';
import { Job as BullJob } from 'bullmq';
import { CreatePrintJobRequestDto } from './printer.dto';
import { PrinterUtils } from './printer.utils';
import { PrinterJobType } from './printer.constants';
import { PrinterManager } from './printer.manager';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import PrinterValidation from './printer.validation';
import { PrinterException } from './printer.exception';

@Processor(QueueRegisterKey.PRINTER)
@Injectable()
export class PrinterConsumer extends WorkerHost {
  constructor(
    private readonly printerUtils: PrinterUtils,
    private readonly printerManager: PrinterManager,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {
    super();
  }

  async process(data: BullJob<CreatePrintJobRequestDto>): Promise<any> {
    const context = `${PrinterConsumer.name}.${this.process.name}`;
    const { jobType, printerIp, printerPort, bitmapDataList, chefOrder } =
      data.data;

    try {
      if (jobType === PrinterJobType.CHEF_ORDER) {
        await this.printerUtils.handlePrintChefOrder(
          printerIp,
          printerPort,
          chefOrder,
        );
      } else if (jobType === PrinterJobType.LABEL_TICKET) {
        if (bitmapDataList && Array.isArray(bitmapDataList)) {
          for (let i = 0; i < bitmapDataList.length; i++) {
            if (
              bitmapDataList[i] &&
              typeof bitmapDataList[i] === 'object' &&
              (bitmapDataList[i] as any).type === 'Buffer'
            ) {
              bitmapDataList[i] = Buffer.from((bitmapDataList[i] as any).data);
            }
          }
        }

        await this.printerUtils.handlePrintChefOrderItemTicket(
          printerIp,
          printerPort,
          bitmapDataList,
        );
      }
    } catch (error) {
      this.logger.error(`Error printing job ${jobType}`, error.stack, context);
      throw new PrinterException(PrinterValidation.ERROR_PRINTING_JOB);
    }
  }
}
