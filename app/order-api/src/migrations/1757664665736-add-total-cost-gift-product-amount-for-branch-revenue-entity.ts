import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotalCostGiftProductAmountForBranchRevenueEntity1757664665736
  implements MigrationInterface
{
  name = 'AddTotalCostGiftProductAmountForBranchRevenueEntity1757664665736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_cost_gift_product_amount_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_cost_gift_product_amount_column\``,
    );
  }
}
