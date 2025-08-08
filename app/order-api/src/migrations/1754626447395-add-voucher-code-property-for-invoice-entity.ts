import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoucherCodePropertyForInvoiceEntity1754626447395
  implements MigrationInterface
{
  name = 'AddVoucherCodePropertyForInvoiceEntity1754626447395';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`voucher_code_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`voucher_code_column\``,
    );
  }
}
