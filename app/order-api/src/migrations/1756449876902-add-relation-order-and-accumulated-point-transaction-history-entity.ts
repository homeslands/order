import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationOrderAndAccumulatedPointTransactionHistoryEntity1756449876902
  implements MigrationInterface
{
  name =
    'AddRelationOrderAndAccumulatedPointTransactionHistoryEntity1756449876902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_transaction_history_tbl\` ADD \`order_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_transaction_history_tbl\` ADD CONSTRAINT \`FK_0751b591841b128a7f5814c27b1\` FOREIGN KEY (\`order_column\`) REFERENCES \`order_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_transaction_history_tbl\` DROP FOREIGN KEY \`FK_0751b591841b128a7f5814c27b1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_transaction_history_tbl\` DROP COLUMN \`order_column\``,
    );
  }
}
