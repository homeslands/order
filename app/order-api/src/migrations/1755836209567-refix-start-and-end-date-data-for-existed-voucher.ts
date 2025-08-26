import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefixStartAndEndDateDataForExistedVoucher1755836209567
  implements MigrationInterface
{
  name = 'RefixStartAndEndDateDataForExistedVoucher1755836209567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // set start_date to start of day (00:00:00)
    await queryRunner.query(`
        UPDATE voucher_tbl 
        SET start_date_column = CAST(DATE(start_date_column) AS DATETIME)
        WHERE start_date_column IS NOT NULL
      `);

    // set end_date to end of day (23:59:59)
    await queryRunner.query(`
        UPDATE voucher_tbl 
        SET end_date_column = DATE_ADD(DATE(end_date_column), INTERVAL 1 DAY) - INTERVAL 1 SECOND
        WHERE end_date_column IS NOT NULL
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE voucher_tbl 
      SET start_date_column = DATE_ADD(CAST(DATE(start_date_column) AS DATETIME), INTERVAL 7 HOUR) 
      WHERE start_date_column IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE voucher_tbl 
      SET end_date_column = DATE_ADD(CAST(DATE(end_date_column) AS DATETIME), INTERVAL 7 HOUR) 
      WHERE end_date_column IS NOT NULL`,
    );
  }
}
