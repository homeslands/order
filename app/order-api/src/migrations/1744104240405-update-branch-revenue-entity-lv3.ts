import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBranchRevenueEntityLv31744104240405
  implements MigrationInterface
{
  name = 'UpdateBranchRevenueEntityLv31744104240405';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_order_cash_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_order_bank_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_order_internal_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_order_internal_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_order_bank_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_order_cash_column\``,
    );
  }
}
