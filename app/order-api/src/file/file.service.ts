import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from './file.entity';
import { Repository } from 'typeorm';
import { FileException } from './file.exception';
import FileValidation from './file.validation';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { FileResponseDto } from './file.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import path from 'path';
import { Workbook } from 'exceljs';
import { generateFileName } from './file.util';
import { Extension } from './file.constant';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  async getFile(filename: string): Promise<FileResponseDto> {
    const file = await this.fileRepository.findOne({
      where: { name: filename },
    });
    if (!file) throw new FileException(FileValidation.FILE_NOT_FOUND);
    return this.mapper.map(file, File, FileResponseDto);
  }

  async uploadFile(file: Express.Multer.File) {
    const context = `${FileService.name}.${this.uploadFile.name}`;
    const createdFile = await this.saveFile(file);
    this.logger.log(`File ${createdFile.name} uploaded successfully`, context);
    return createdFile;
  }

  async uploadFiles(files: Express.Multer.File[]) {
    const context = `${FileService.name}.${this.uploadFiles.name}`;
    const uploadedFiles = await Promise.all(
      files.map((file) => this.saveFile(file)),
    );
    this.logger.log(`Files uploaded successfully`, context);
    return uploadedFiles;
  }

  private async saveFile(requestData: Express.Multer.File): Promise<File> {
    if (!requestData) throw new FileException(FileValidation.FILE_NOT_FOUND);
    const file = new File();
    const filename = requestData.originalname.split('.')[0].replace(' ', '-');
    Object.assign(file, {
      data: requestData.buffer.toString('base64'),
      name: `${filename}-${Date.now()}`,
      extension: requestData.originalname.split('.')[1],
      mimetype: requestData.mimetype,
      size: requestData.size,
    });

    this.fileRepository.create(file);
    return await this.fileRepository.save(file);
  }

  public async removeFile(filename?: string): Promise<void> {
    const context = `${FileService.name}.${this.removeFile.name}`;
    if (filename) {
      const file = await this.fileRepository.findOne({
        where: { name: filename },
      });
      if (!file) return;
      await this.fileRepository.remove(file);
    }
    this.logger.log(`File ${filename} removed successfully`, context);
  }

  public handleDuplicateFilesName(
    files: Express.Multer.File[],
  ): Express.Multer.File[] {
    const fileNameCount: { [key: string]: number } = {};
    const renamedFiles: Express.Multer.File[] = [];

    files.forEach((file) => {
      const fileExtension = file.originalname.split('.').pop();
      const baseName = file.originalname.replace(/\.[^/.]+$/, '');

      if (fileNameCount[baseName]) {
        fileNameCount[baseName]++;
      } else {
        fileNameCount[baseName] = 1;
      }

      const newName =
        fileNameCount[baseName] === 1
          ? file.originalname
          : `${baseName}(${fileNameCount[baseName] - 1}).${fileExtension}`;

      renamedFiles.push({
        ...file,
        originalname: newName,
      });
    });

    return renamedFiles;
  }

  public async generateExcelFile({
    filename,
    cellData,
  }: {
    filename: string;
    cellData: { cellPosition: string; value: string; type: string }[];
  }): Promise<FileResponseDto> {
    // Read file
    const templatePath = path.resolve("public/templates/excel", filename);
    const workbook = new Workbook();
    await workbook.xlsx.readFile(templatePath);

    // Write file
    if (workbook.worksheets.length <= 0)
      throw new FileException(FileValidation.FILE_NOT_FOUND);
    const worksheet = workbook.worksheets[0];

    for (const item of cellData) {
      if (item.type === "data") {
        worksheet.getCell(item.cellPosition).value = item.value;
      } else if (item.type === "image") {
        const imageUrl = item.value;
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();

        const image = workbook.addImage({
          buffer: buffer,
          extension: "jpeg",
        });

        const tl = this.extractPosition(item.cellPosition);
        if (tl) {
          worksheet.addImage(image, {
            tl: { col: 0, row: 0 },
            ext: { width: 120, height: 80 }, // Set desired width and height
            editAs: "oneCell", // Optional: can be "oneCell" or "absolute"
          });
        }
      }
    }
    // Generate buffer of the Excel file in memory
    const buffer = await workbook.xlsx.writeBuffer();
    const nodeBuffer: Buffer = Buffer.from(buffer);

    return { 
      name: generateFileName(Extension.EXCEL),
      extension: Extension.EXCEL,
      mimetype: Extension.EXCEL,
      data: nodeBuffer,
      size: nodeBuffer.length
    };
  }

  private extractPosition(cellPosition: string) {
    const match = cellPosition.match(/^([A-Z]+)(\d+)$/);

    if (match) {
      return {
        col: this.columnToNumber(match[1]), // Extract the letters (column)
        row: parseInt(match[2], 10), // Extract the digits (row) and convert to a number
      };
    }

    // If the cellPosition is not valid, return null or handle the error
    return null;
  }

  private columnToNumber(column: string) {
    let number = 0;
    for (let i = 0; i < column.length; i++) {
      number = number * 26 + (column.charCodeAt(i) - "A".charCodeAt(0) + 1);
    }
    return number;
  }

  async getTemplateExcel(
    filename: string
  ): Promise<FileResponseDto> {
    const templatePath = path.resolve("public/templates/excel", filename);
    const workbook = new Workbook();
    await workbook.xlsx.readFile(templatePath);

    // Check if the workbook has worksheets
    if (workbook.worksheets.length <= 0) {
      throw new FileException(FileValidation.FILE_NOT_FOUND);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const nodeBuffer: Buffer = Buffer.from(buffer);

    return {
      name: generateFileName(Extension.EXCEL),
      extension: Extension.EXCEL,
      mimetype: Extension.EXCEL,
      data: nodeBuffer,
      size: nodeBuffer.length,
    };
  }
}
