import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationAccumulatedPointAndAccumulatedPointTransactionHistoryEntity1756450637708
  implements MigrationInterface
{
  name =
    'AddRelationAccumulatedPointAndAccumulatedPointTransactionHistoryEntity1756450637708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_transaction_history_tbl\` ADD \`accumulated_point_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_transaction_history_tbl\` ADD CONSTRAINT \`FK_896ec1603b223c38c1a371e6127\` FOREIGN KEY (\`accumulated_point_column\`) REFERENCES \`accumulated_point_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_transaction_history_tbl\` DROP FOREIGN KEY \`FK_896ec1603b223c38c1a371e6127\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`accumulated_point_transaction_history_tbl\` DROP COLUMN \`accumulated_point_column\``,
    );
  }
}
