export enum PrinterDataType {
  TSPL_ZPL = 'tspl-zpl',
  ESC_POS = 'esc-pos',
}

export enum PrinterJobType {
  PENDING = 'pending',
  PRINTING = 'printing',
  PRINTED = 'printed',
  FAILED = 'failed'
}