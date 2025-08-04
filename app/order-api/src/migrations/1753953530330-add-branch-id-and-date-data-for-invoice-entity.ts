import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchIdAndDateDataForInvoiceEntity1753953530330
  implements MigrationInterface
{
  name = 'AddBranchIdAndDateDataForInvoiceEntity1753953530330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE invoice_tbl i
      JOIN order_tbl o ON o.invoice_column = i.id_column
      JOIN branch_tbl b ON b.id_column = o.branch_column
      SET i.branch_id_column = b.id_column, i.date_column = o.created_at_column`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE \`invoice_tbl\` SET \`branch_id_column\` = NULL
    `);
    await queryRunner.query(`
      UPDATE \`invoice_tbl\` SET \`date_column\` = NULL
    `);
  }
}
