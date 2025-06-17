import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvoiceItemEntity1749191733391
  implements MigrationInterface
{
  name = 'UpdateInvoiceItemEntity1749191733391';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` ADD \`discount_type_column\` varchar(255) NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` ADD \`voucher_value_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` DROP COLUMN \`voucher_value_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` DROP COLUMN \`discount_type_column\``,
    );
  }
}
