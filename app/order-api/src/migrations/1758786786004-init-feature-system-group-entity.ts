import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitFeatureSystemGroupEntity1758786786004
  implements MigrationInterface
{
  name = 'InitFeatureSystemGroupEntity1758786786004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`feature_system_group_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`order_column\` int NOT NULL, UNIQUE INDEX \`IDX_a95a7d8a6313650c904e357566\` (\`slug_column\`), UNIQUE INDEX \`IDX_e59e2b1fd9587ed54124985c67\` (\`name_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_e59e2b1fd9587ed54124985c67\` ON \`feature_system_group_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a95a7d8a6313650c904e357566\` ON \`feature_system_group_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`feature_system_group_tbl\``);
  }
}
