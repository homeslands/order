import { getRandomString } from 'src/helper';
import { v4 as uuidv4 } from 'uuid';
import { PaymentMethod } from 'src/payment/payment.constants';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreditCardPaymentMethodForExistedCashVoucher1757991418729
  implements MigrationInterface
{
  name = 'AddCreditCardPaymentMethodForExistedCashVoucher1757991418729';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const creditCardPaymentMethod = PaymentMethod.CREDIT_CARD;
    const cashPaymentMethod = PaymentMethod.CASH;

    const vouchers = await queryRunner.query(`
        SELECT v.id_column FROM voucher_tbl v
        JOIN voucher_payment_method_tbl vpm ON vpm.voucher_column = v.id_column
        WHERE vpm.payment_method_column = '${cashPaymentMethod}'
        AND v.deleted_at_column is null
      `);
    for (const voucher of vouchers) {
      const voucherId = voucher.id_column;

      await queryRunner.query(
        `
                INSERT INTO voucher_payment_method_tbl (id_column, slug_column, voucher_column, payment_method_column)
                VALUES (?, ?, ?, ?)
                `,
        [uuidv4(), getRandomString(), voucherId, creditCardPaymentMethod],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const creditCardPaymentMethod = PaymentMethod.CREDIT_CARD;

    await queryRunner.query(`
        DELETE FROM voucher_payment_method_tbl WHERE payment_method_column = '${creditCardPaymentMethod}';
      `);
  }
}
