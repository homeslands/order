import { PrinterType } from '../printer.constants';

export interface IPrinterConnection {
  type: PrinterType;
  send(data: Buffer): Promise<void>;
  isConnected(): Promise<boolean>;
  close(): void;
}
