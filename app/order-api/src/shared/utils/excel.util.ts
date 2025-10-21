export class ExcelUtil {
  static ALIGNMENT_CENTER: any = {
    horizontal: 'center',
    vertical: 'middle',
  };

  static FONT_BOLD: any = {
    name: 'Times New Roman',
    family: 4,
    size: 12,
    color: {
      argb: '000000',
    },
    bold: true,
  };

  static FONT_ITALIC: any = {
    name: 'Times New Roman',
    family: 4,
    size: 12,
    color: {
      argb: '000000',
    },
    italic: false,
  };

  static FONT_NORMAL: any = {
    name: 'Times New Roman',
    family: 4,
    size: 12,
    color: {
      argb: '000000',
    },
  };

  static BORDER: any = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  static WIDTH_COL_DATE = 20;
  static WIDTH_COL_STT = 10;
  static WIDTH_COL_CODE = 15;
  static WIDTH_COL_SHORT = 20;
  static WIDTH_COL_MEDIUM = 30;
  static WIDTH_COL_LONG = 40;
  static WIDTH_COL_ADDRESS = 80;
}
