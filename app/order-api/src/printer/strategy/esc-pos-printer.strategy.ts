import { PrinterTypes, ThermalPrinter } from 'node-thermal-printer';
import { PrinterType } from '../printer.constants';
import { IPrinterConnection } from './printer.strategy';
import { PrinterException } from '../printer.exception';
import PrinterValidation from '../printer.validation';
import { Logger } from '@nestjs/common';

export class EscPosPrinterConnection implements IPrinterConnection {
  public readonly type = PrinterType.ESC_POS;

  private printer: ThermalPrinter;

  constructor(
    private readonly ip: string,
    private readonly port: string,
    private readonly logger: Logger,
  ) {
    this.printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${ip}:${port}`,
    });
  }

  async send(data: Buffer): Promise<void> {
    const context = `${EscPosPrinterConnection.name}.${this.send.name}`;
    try {
      this.logger.log(
        `Sending ${data.length} bytes to printer ${this.ip}:${this.port}`,
        context,
      );
      await this.printer.printImageBuffer(data);
      await this.printer.cut();
      await this.printer.execute();

      this.logger.log(
        `Sent ${data.length} bytes to printer ${this.ip}:${this.port}`,
        context,
      );
    } catch (err) {
      this.logger.error(
        PrinterValidation.EOS_POST_SEND_ERROR,
        err.stack,
        context,
      );
      throw new PrinterException(PrinterValidation.EOS_POST_SEND_ERROR);
    }
  }

  async isConnected(): Promise<boolean> {
    const context = `${EscPosPrinterConnection.name}.${this.isConnected.name}`;
    this.logger.log(`Checking if printer is connected`, context);
    const isConnected = await this.printer.isPrinterConnected();
    this.logger.log(`Printer is connected: ${isConnected}`, context);
    return isConnected;
  }

  close(): void {
    // Not explicitly supported in library, leave empty
  }
}
