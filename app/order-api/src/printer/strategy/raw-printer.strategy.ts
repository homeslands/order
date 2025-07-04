import { Logger } from '@nestjs/common';
import { IPrinterConnection } from './printer.strategy';
import * as net from 'net';
import { PrinterType } from '../printer.constants';

export class RawPrinterConnection implements IPrinterConnection {
  public type = PrinterType.RAW;
  private socket: net.Socket;
  constructor(
    private readonly ip: string,
    private readonly port: string,
    private readonly logger: Logger,
  ) {
    this.socket = new net.Socket();
    this.socket.connect({ host: ip, port: parseInt(port), family: 4 }, () => {
      this.logger.log(`Connected to RAW printer ${ip}`);
    });

    this.socket.on('error', (err) => {
      this.logger.error(`RAW printer ${ip} error`, err);
    });

    this.socket.on('close', () => {
      this.logger.warn(`RAW printer ${ip} disconnected`);
    });
  }

  async send(data: Buffer): Promise<void> {
    const context = `${RawPrinterConnection.name}.${this.send.name}`;
    this.logger.log(`Sending data to RAW printer ${this.ip}`, context);
    await this.isConnected();
    return new Promise((resolve, reject) => {
      this.socket.write(data, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async isConnected(): Promise<boolean> {
    const context = `${RawPrinterConnection.name}.${this.isConnected.name}`;
    this.logger.log(`Checking if RAW printer ${this.ip} is connected`, context);
    const isConnected = !this.socket.destroyed;
    this.logger.log(
      `RAW printer ${this.ip} is connected: ${isConnected}`,
      context,
    );
    return isConnected;
  }

  close(): void {
    this.socket.destroy();
  }
}
