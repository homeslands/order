import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApplicabilityRulePropertyForVoucherEntity1753150429836
  implements MigrationInterface
{
  name = 'AddApplicabilityRulePropertyForVoucherEntity1753150429836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`applicability_rule_column\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`applicability_rule_column\``,
    );
  }
}
