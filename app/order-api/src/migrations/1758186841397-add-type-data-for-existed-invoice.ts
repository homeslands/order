import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeDataForExistedInvoice1758186841397
  implements MigrationInterface
{
  name = 'AddTypeDataForExistedInvoice1758186841397';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE invoice_tbl i 
        INNER JOIN order_tbl o ON o.invoice_column = i.id_column
        SET i.type_column = o.type_column
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE invoice_tbl 
        SET type_column = NULL
    `);
  }
}
