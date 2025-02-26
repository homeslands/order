import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';

@Injectable()
export class ExcelService {
  constructor() {}

  async readExcel(file?: Express.Multer.File) {
    const workbook = new Workbook();
    if (!file?.buffer) throw new BadRequestException('File not found');

    await workbook.xlsx.load(file.buffer);

    if (workbook.worksheets.length <= 0)
      throw new BadRequestException('File not any sheets');
  }
}
