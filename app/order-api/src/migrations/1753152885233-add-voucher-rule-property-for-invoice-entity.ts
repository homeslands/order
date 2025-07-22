import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoucherRulePropertyForInvoiceEntity1753152885233
  implements MigrationInterface
{
  name = 'AddVoucherRulePropertyForInvoiceEntity1753152885233';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`voucher_rule_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`voucher_rule_column\``,
    );
  }
}
