import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitFeatureFlagSystemEntity1758788452044
  implements MigrationInterface
{
  name = 'InitFeatureFlagSystemEntity1758788452044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`feature_flag_system_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`group_name_column\` varchar(255) NOT NULL, \`name_column\` varchar(255) NOT NULL, \`order_column\` int NOT NULL, \`is_locked_column\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_7374dd560c0fb39f03add12dd3\` (\`slug_column\`), UNIQUE INDEX \`IDX_33ed1aa93128727d7cc02f4ee2\` (\`name_column\`, \`group_name_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_33ed1aa93128727d7cc02f4ee2\` ON \`feature_flag_system_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7374dd560c0fb39f03add12dd3\` ON \`feature_flag_system_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`feature_flag_system_tbl\``);
  }
}
