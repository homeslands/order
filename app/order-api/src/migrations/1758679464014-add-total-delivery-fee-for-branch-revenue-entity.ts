import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotalDeliveryFeeForBranchRevenueEntity1758679464014
  implements MigrationInterface
{
  name = 'AddTotalDeliveryFeeForBranchRevenueEntity1758679464014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_delivery_fee_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_delivery_fee_column\``,
    );
  }
}
