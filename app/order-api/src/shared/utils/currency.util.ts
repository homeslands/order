import * as curr from 'currency.js';

export class CurrencyUtil {
  static formatCurrency(value: number) {
    const safeValue = value < 0 ? 0 : value;
    return curr
      .default(safeValue, { separator: ',', symbol: '', precision: 0 })
      .format();
  }
}
