import moment from 'moment';
import { customAlphabet } from 'nanoid';

export class GiftCardUtil {
  static SERIAL_PREFIX = 1000;

  /**
   * Generate serial with struct
   * [Prefix][Batch][Random]
   * Example: 1000 27062025 123456
   */
  static generateSerial(): string {
    const batch = this.createBatchCode();
    const randomPart = this.randomDigits(6);
    return `${this.SERIAL_PREFIX}${batch}${randomPart}`;
  }

  static createBatchCode(): string {
    return moment().format('DDMMYYYY');
  }

  /**
   * Create code with checksum Luhn
   * Example: 123456789012
   */
  static generateRechargeCode(): string {
    // Sinh 11 số random
    const baseDigits = this.randomDigits(11);
    // Tính checksum
    const checksum = this.luhnChecksum(baseDigits);
    return `${baseDigits}${checksum}`;
  }

  /**
   * Gen random n numbers
   */
  private static randomDigits(length: number): string {
    const nanoid = customAlphabet('0123456789', length);
    return nanoid();
  }

  /**
   * Calc checksum Luhn algorithm
   */
  static luhnChecksum(input: string): number {
    let sum = 0;
    let shouldDouble = false;

    // Duyệt từ phải sang trái
    for (let i = input.length - 1; i >= 0; i--) {
      let digit = parseInt(input.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return (10 - (sum % 10)) % 10;
  }

  static calcExpirationDate(EXPIRES_DATE?: number): Date {
    return moment()
      .add(EXPIRES_DATE ?? 6, 'months')
      .toDate(); // expires end of the day 12 months later
  }
}
