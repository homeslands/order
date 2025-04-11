import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVocherValueAndIdForInvoiceEntity1744358718217
  implements MigrationInterface
{
  name = 'AddVocherValueAndIdForInvoiceEntity1744358718217';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`voucher_value_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`voucher_id_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`voucher_id_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`voucher_value_column\``,
    );
  }
}
