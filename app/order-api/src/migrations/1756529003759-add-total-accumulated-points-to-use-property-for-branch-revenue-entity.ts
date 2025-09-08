import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotalAccumulatedPointsToUsePropertyForBranchRevenueEntity1756529003759
  implements MigrationInterface
{
  name =
    'AddTotalAccumulatedPointsToUsePropertyForBranchRevenueEntity1756529003759';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_accumulated_points_to_use_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_accumulated_points_to_use_column\``,
    );
  }
}
