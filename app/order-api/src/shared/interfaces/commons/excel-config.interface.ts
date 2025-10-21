export class ExcelConfig {
  headers: Array<any>; // [{header?: string; key?: string; width?: number; style?: any}]
  merges: IMergeCell[];
  wrapText: boolean;
  numberOfRowHeader: number[] = [1];
  totalLastRow?: boolean;
  fntBoldRows?: number[];
  notDupHeader?: boolean;
  border?: boolean;
}

export interface IMergeCell {
  // merge by start row, start column, end row, end column (equivalent to K10:M12)
  merge: IMerge; // 10,11,12,13
  value?: any;
}

export interface IMerge {
  sRow: number;
  sCol: number;
  eRow: number;
  eCol: number;
}

export interface IExcelFromServer {
  data: any;
  fileName: string;
  type: string;
}

export interface IExcelFile {
  name: string;
  extension: string;
  mimetype: string;
  data: any;
  size: number;
}
