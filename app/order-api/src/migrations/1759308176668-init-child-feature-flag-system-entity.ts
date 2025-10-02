import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitChildFeatureFlagSystemEntity1759308176668
  implements MigrationInterface
{
  name = 'InitChildFeatureFlagSystemEntity1759308176668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`child_feature_flag_system_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NOT NULL, \`parent_name_column\` varchar(255) NOT NULL, \`is_locked_column\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_ffcdf2cb87207180653db1180b\` (\`slug_column\`), UNIQUE INDEX \`IDX_f5ea9e341547ba70367435f7f9\` (\`name_column\`, \`parent_name_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_f5ea9e341547ba70367435f7f9\` ON \`child_feature_flag_system_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_ffcdf2cb87207180653db1180b\` ON \`child_feature_flag_system_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`child_feature_flag_system_tbl\``);
  }
}
