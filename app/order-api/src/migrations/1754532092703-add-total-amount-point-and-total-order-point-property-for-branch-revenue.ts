import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotalAmountPointAndTotalOrderPointPropertyForBranchRevenue1754532092703
  implements MigrationInterface
{
  name =
    'AddTotalAmountPointAndTotalOrderPointPropertyForBranchRevenue1754532092703';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_order_point_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_amount_point_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_amount_point_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_order_point_column\``,
    );
  }
}
