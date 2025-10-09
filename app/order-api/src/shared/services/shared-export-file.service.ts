import { Injectable } from '@nestjs/common';
import {
  ExcelConfig,
  IExcelFile,
} from '../interfaces/commons/excel-config.interface';
import * as Excel from 'exceljs';
import { ExcelUtil } from '../utils/excel.util';
import { Extension } from 'src/file/file.constant';

@Injectable()
export class SharedExportFileService {
  public async exportExcel(
    fileName: string,
    config: ExcelConfig,
    data: any[],
  ): Promise<IExcelFile> {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.columns = config.headers;

    worksheet.addRows(data);

    if (config.merges) {
      //double header
      if (!config.notDupHeader) {
        worksheet.duplicateRow(1, 1, true);
      }
      config.merges.forEach((m) => {
        worksheet.mergeCells(
          m.merge.sRow,
          m.merge.sCol,
          m.merge.eRow,
          m.merge.eCol,
        );
        if (m.value === '' || m.value) {
          worksheet.getCell(m.merge.sRow, m.merge.eCol).value = m.value;
        }
      });
    }

    worksheet.eachRow((r) => {
      r.eachCell({ includeEmpty: true }, (e) => {
        if (e) {
          if (config.wrapText && e.alignment) {
            e.alignment.wrapText = true;
          } else if (config.wrapText) {
            e.alignment = { wrapText: true };
          }

          if (e.alignment) {
            e.alignment.vertical = 'middle';
          }

          if (config.border) {
            e.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          }

          if (e.style.numFmt && this.isDecimalNumFmt(e.style.numFmt)) {
            e.numFmt =
              typeof e.value == 'number' && Number.isInteger(e.value)
                ? this.cutBeforeDot(e.style.numFmt)
                : e.style.numFmt;
          }

          e.font = ExcelUtil.FONT_NORMAL;
        }
      });
    });

    const lastRow = worksheet.lastRow;
    if (config.totalLastRow) {
      lastRow.font = ExcelUtil.FONT_BOLD;
    }

    if (config.fntBoldRows && config.fntBoldRows.length > 0) {
      config.fntBoldRows.forEach((item) => {
        const row = worksheet.getRow(item);
        row.font = ExcelUtil.FONT_BOLD;
      });
    }

    // Format header
    config.numberOfRowHeader.forEach((i) => {
      const headerRow = worksheet.getRow(i);
      headerRow.eachCell((cell) => {
        if (cell.value) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {
              argb: 'EEEEEE',
            },
          };
          cell.font = ExcelUtil.FONT_BOLD;
          cell.alignment = ExcelUtil.ALIGNMENT_CENTER;
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const nodeBuffer: Buffer = Buffer.from(buffer);

    return {
      name: `${fileName}.xlsx`,
      extension: Extension.EXCEL,
      mimetype: Extension.EXCEL,
      data: nodeBuffer,
      size: nodeBuffer.length,
    };
  }

  private isDecimalNumFmt(fmt): boolean {
    if (fmt.includes('%')) {
      return false;
    }
    return /[0#]+[.,][0#]+/.test(fmt);
  }

  private cutBeforeDot(s): string {
    const idx = s.indexOf('.');
    return idx >= 0 ? s.substring(0, idx) : s;
  }
}
