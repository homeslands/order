import { DataSource } from 'typeorm';
import Transport from 'winston-transport';
import { Logger } from './logger.entity';

export class DatabaseTransport extends Transport {
  private dataSource: DataSource;

  constructor(dataSource: DataSource, opts?: Transport.TransportStreamOptions) {
    super(opts);
    this.dataSource = dataSource;
  }

  async log(info: any, next: () => void) {
    setImmediate(() => this.emit('logged', info));
    try {
      const loggerRepository = this.dataSource.getRepository(Logger);
      const logger = {
        level: info.level,
        message: info.message,
        context: info.context || null,
        pid: process.pid,
        timestamp: info.timestamp,
      } as Logger;
      loggerRepository.create(logger);
      await loggerRepository.save(logger);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving log to database:', error);
    }

    next();
  }
}
