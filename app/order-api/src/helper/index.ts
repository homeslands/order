import moment from 'moment';
import { PaymentMethod } from 'src/payment/payment.constants';
import { v4 as uuidv4 } from 'uuid';

/**
 *  Format moment to yyyy-MM-ddTHH:mm:ss.SSSZ format
 * @returns {string} formatted moment
 */
export const formatMoment = (): string =>
  moment()
    .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    .replace(/(\+\d{2}):(\d{2})$/, '$1$2');

/**
 * Format number to currency
 * @param {number} number
 * @returns {string} formatted currency
 */
export function formatCurrency(number: number): string {
  return `${number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`;
}

/**
 * Get the day index (0 = Monday, 1 = Tuesday, etc.)
 * @param {Date} date
 * @returns {number} day index
 */
export const getDayIndex = (date: Date): number => {
  const startOfWeek = moment(date).startOf('isoWeek'); // Monday of the week for the target date
  return moment(date).diff(startOfWeek, 'days'); // Get the day index (0 = Monday, 1 = Tuesday, etc.)
};

export const formatDate = (date: Date, format: string) => {
  return moment(date).format(format);
};

export const formatPaymentMethod = (method: string) => {
  switch (method) {
    case PaymentMethod.BANK_TRANSFER:
      return 'Chuyển khoản';
    case PaymentMethod.CASH:
      return 'Tiền mặt';
    case PaymentMethod.INTERNAL:
      return 'Ví nội bộ';
    case PaymentMethod.POINT:
      return 'Xu';
    default:
      return 'Không tìm thấy PTTT';
  }
};

/**
 * Return 13 characters from random UUID
 */
export const getRandomString = () => {
  const uuid = uuidv4(); // Generate a UUID
  const numericPart = uuid.replace(/-/g, ''); // Remove non-numeric characters
  return numericPart.slice(0, 10); // Get the first 13 digits
};
