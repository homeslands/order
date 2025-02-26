import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSystemConfig1733993426060 implements MigrationInterface {
  name = 'AddSystemConfig1733993426060';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`system_config_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`key_column\` varchar(255) NOT NULL, \`value_column\` varchar(255) NOT NULL, \`description_column\` text NULL, UNIQUE INDEX \`IDX_60a6c7dc8c93eb1ad802fd2660\` (\`slug_column\`), UNIQUE INDEX \`IDX_16a94bf229266d48f0f3aca0f5\` (\`key_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_16a94bf229266d48f0f3aca0f5\` ON \`system_config_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_60a6c7dc8c93eb1ad802fd2660\` ON \`system_config_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`system_config_tbl\``);
  }
}
