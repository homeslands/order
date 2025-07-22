import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataForApplicabilityRule1753150868265
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE \`voucher_tbl\`
        SET \`applicability_rule_column\` = 'all_required'
        WHERE \`type_column\` IN ('fixed_value', 'percent_order')
      `);

    await queryRunner.query(`
        UPDATE \`voucher_tbl\`
        SET \`applicability_rule_column\` = 'at_least_one_required'
        WHERE \`type_column\` = 'same_price_product'
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE \`voucher_tbl\`
        SET \`applicability_rule_column\` = ''
        WHERE \`type_column\` IN ('fixed_value', 'percent_order', 'same_price_product')
      `);
  }
}
