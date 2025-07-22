import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataForVoucherRule1753153068301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE \`invoice_tbl\`
        SET \`voucher_rule_column\` = 'all_required'
        WHERE \`voucher_type_column\` IN ('fixed_value', 'percent_order')
      `);

    await queryRunner.query(`
        UPDATE \`invoice_tbl\`
        SET \`voucher_rule_column\` = 'at_least_one_required'
        WHERE \`voucher_type_column\` = 'same_price_product'
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE \`invoice_tbl\`
        SET \`voucher_rule_column\` = NULL
        WHERE \`voucher_type_column\` IN ('fixed_value', 'percent_order', 'same_price_product')
      `);
  }
}
