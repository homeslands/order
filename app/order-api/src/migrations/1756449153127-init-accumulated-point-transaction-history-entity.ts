import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAccumulatedPointTransactionHistoryEntity1756449153127
  implements MigrationInterface
{
  name = 'InitAccumulatedPointTransactionHistoryEntity1756449153127';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`accumulated_point_transaction_history_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`type_column\` varchar(255) NOT NULL, \`points_column\` int NOT NULL, \`last_points_column\` int NOT NULL, \`current_points_percentage_column\` int NOT NULL, \`date_column\` timestamp(6) NOT NULL, \`status_column\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_b57813764b40ed15a814121b30\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_b57813764b40ed15a814121b30\` ON \`accumulated_point_transaction_history_tbl\``,
    );
    await queryRunner.query(
      `DROP TABLE \`accumulated_point_transaction_history_tbl\``,
    );
  }
}
