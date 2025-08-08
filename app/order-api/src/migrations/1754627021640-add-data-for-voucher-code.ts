import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataForVoucherCode1754627021640 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE invoice_tbl iv
        JOIN (
            SELECT
            id_column,
            code_column
            FROM voucher_tbl
        ) v 
        ON v.id_column = iv.voucher_id_column
        AND iv.voucher_id_column IS NOT NULL
        SET iv.voucher_code_column = v.code_column;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE invoice_tbl SET voucher_code_column = NULL WHERE voucher_code_column IS NOT NULL`,
    );
  }
}
