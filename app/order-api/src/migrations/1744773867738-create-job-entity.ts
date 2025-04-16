import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJobEntity1744773867738 implements MigrationInterface {
  name = 'CreateJobEntity1744773867738';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`job_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`type_column\` varchar(255) NOT NULL, \`data_column\` text NOT NULL, \`status_column\` varchar(255) NOT NULL DEFAULT 'pending', \`retry_count_column\` int NOT NULL DEFAULT '0', \`last_error_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_409529048e5dffa3f2feedff2c\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_409529048e5dffa3f2feedff2c\` ON \`job_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`job_tbl\``);
  }
}
