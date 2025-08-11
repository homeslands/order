import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLossAmountPropertyForBranchRevenue1754014292235
  implements MigrationInterface
{
  name = 'AddLossAmountPropertyForBranchRevenue1754014292235';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`loss_amount_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`loss_amount_column\``,
    );
  }
}
