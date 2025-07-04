export enum PrinterDataType {
  TSPL_ZPL = 'tspl-zpl',
  ESC_POS = 'esc-pos',
}

export enum PrinterType {
  RAW = 'RAW', // TSPL, ZPL, ...
  ESC_POS = 'ESC_POS', // EPSON, STAR...
}

export enum PrinterJobType {
  CHEF_ORDER = 'chef-order',
  LABEL_TICKET = 'label-ticket',
}
