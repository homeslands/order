import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTotalOrderAndAmountCreditCardForBranchRevenueEntity1757726430063
  implements MigrationInterface
{
  name = 'AddTotalOrderAndAmountCreditCardForBranchRevenueEntity1757726430063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_amount_credit_card_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` ADD \`total_order_credit_card_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_order_credit_card_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`branch_revenue_tbl\` DROP COLUMN \`total_amount_credit_card_column\``,
    );
  }
}
