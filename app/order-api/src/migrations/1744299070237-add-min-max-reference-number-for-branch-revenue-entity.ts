import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMinMaxReferenceNumberForBranchRevenueEntity1744299070237
  implements MigrationInterface
{
  name = 'AddMinMaxReferenceNumberForBranchRevenueEntity1744299070237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`min_reference_number_order_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`max_reference_number_order_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`max_reference_number_order_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`min_reference_number_order_column\``,
    );
  }
}
