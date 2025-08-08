import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import * as fs from 'fs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as path from 'path';
import { GoogleDriveService } from './google-drive.service';
import { DbException } from './db.exception';
import { DbValidation } from './db.validation';
import { createReadStream, statSync } from 'fs';
import { Readable } from 'stream';

@Injectable()
export class DbService {
  private readonly databaseMySql =
    this.configService.get<string>('DATABASE_NAME');
  private readonly hostMySql = this.configService.get<string>('DATABASE_HOST');
  private readonly userMySql =
    this.configService.get<string>('DATABASE_USERNAME');
  private readonly passwordMySql =
    this.configService.get<string>('DATABASE_PASSWORD');

  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly googleDriveService: GoogleDriveService,
  ) {}

  async downloadBackup(): Promise<{
    data: Readable;
    name: string;
    extension: string;
    size: number;
    mimetype: string;
  }> {
    const dumpFilePath = await this.export();

    const extension = path.extname(dumpFilePath).substring(1);
    const name = path.basename(dumpFilePath, `.${extension}`);
    const size = statSync(dumpFilePath).size;
    const mimetype =
      extension === 'gz' ? 'application/gzip' : 'application/sql';

    return {
      data: createReadStream(dumpFilePath),
      name,
      extension,
      size,
      mimetype,
    };
  }

  async backup(): Promise<string> {
    const dumpFilePath = await this.export();

    // Upload the file to the cloud storage
    const fileId = await this.googleDriveService.uploadFile(
      dumpFilePath,
      'application/sql',
    );

    // Clean up the temporary file
    await this.cleanUp(dumpFilePath);

    return fileId;
  }

  private async export(): Promise<string> {
    const context = `${DbService.name}.${this.export.name}`;
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '_');
      const fileName = `${this.databaseMySql}_${timestamp}.sql`;
      const backupPath = path.resolve('public/backup');
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }
      const dumpFilePath = path.join(backupPath, fileName);

      // Create the dump command
      const dumpCommand = `mysqldump -h ${this.hostMySql} -u ${this.userMySql} -p${this.passwordMySql} ${this.databaseMySql} > ${dumpFilePath}`;

      exec(dumpCommand, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`Error: ${error.message}`, error.stack, context);
          return reject(new DbException(DbValidation.EXPORT_DATABASE_ERROR));
        }
        if (stderr) {
          this.logger.error(`stderr: ${stderr}`, null, context);
        }
        resolve(dumpFilePath);
      });
    });
  }

  private async cleanUp(filePath: string) {
    const context = `${DbService.name}.${this.cleanUp.name}`;
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          this.logger.error(
            `Error deleting temporary file: ${err.message}`,
            err.stack,
            context,
          );
          return reject(err);
        }
        resolve(0);
      });
    });
  }
}
