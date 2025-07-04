import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPrinterConnection } from './strategy/printer.strategy';
import { PrinterType } from './printer.constants';
import { RawPrinterConnection } from './strategy/raw-printer.strategy';
import { EscPosPrinterConnection } from './strategy/esc-pos-printer.strategy';
import { PrinterException } from './printer.exception';
import PrinterValidation from './printer.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class PrinterManager {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  private connections = new Map<string, IPrinterConnection>();

  getOrCreateConnection(
    ip: string,
    port: string,
    type: PrinterType,
  ): IPrinterConnection {
    const context = `PrinterManager.getOrCreateConnection(${ip}, ${port}, ${type})`;
    const key = `${type}:${ip}:${port}`;
    if (this.connections.has(key)) {
      return this.connections.get(key);
    }

    let connection: IPrinterConnection;

    if (type === PrinterType.RAW) {
      connection = new RawPrinterConnection(ip, port, this.logger);
    } else if (type === PrinterType.ESC_POS) {
      connection = new EscPosPrinterConnection(ip, port, this.logger);
    } else {
      this.logger.error(`Unsupported printer type: ${type}`, context);
      throw new PrinterException(
        PrinterValidation.UN_SUPPORTED_PRINTER_TYPE,
        `Unsupported printer type: ${type}`,
      );
    }

    this.connections.set(key, connection);

    if (type === PrinterType.ESC_POS) {
      this.closeConnection(ip, port, type);
    }
    return connection;
  }

  closeConnection(ip: string, port: string, type: PrinterType) {
    const context = `${PrinterManager.name}.${this.closeConnection.name}`;
    const key = `${type}:${ip}:${port}`;
    const conn = this.connections.get(key);
    if (conn) {
      conn.close();
      this.connections.delete(key);
      this.logger.log(`Closed connection to printer ${ip}:${port}`, context);
    } else {
      this.logger.warn(
        `No connection found to close for printer ${ip}:${port}`,
        context,
      );
    }
  }
}
