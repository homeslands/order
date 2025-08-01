import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePointTransactionSchemaMigration1753950822479
  implements MigrationInterface
{
  name = 'UpdatePointTransactionSchemaMigration1753950822479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`point_transaction_tbl\` ADD \`balance_column\` decimal(10,2) NOT NULL DEFAULT '0.00'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`point_transaction_tbl\` DROP COLUMN \`balance_column\``,
    );
  }
}
