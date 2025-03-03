import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyLogger1731845942772 implements MigrationInterface {
  name = 'ModifyLogger1731845942772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`logger_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`level_column\` varchar(255) NOT NULL, \`message_column\` text NOT NULL, \`context_column\` varchar(255) NULL, \`timestamp_column\` varchar(255) NOT NULL, \`pid_column\` int NOT NULL, UNIQUE INDEX \`IDX_c9c5c70bbbfa5acf4991fd65ba\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_c9c5c70bbbfa5acf4991fd65ba\` ON \`logger_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`logger_tbl\``);
  }
}
