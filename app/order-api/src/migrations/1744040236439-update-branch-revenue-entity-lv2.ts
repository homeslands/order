import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBranchRevenueEntityLv21744040236439
  implements MigrationInterface
{
  name = 'UpdateBranchRevenueEntityLv21744040236439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_amount_bank_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_amount_cash_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_amount_internal_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_amount_internal_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_amount_cash_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_amount_bank_column\``,
    );
  }
}
