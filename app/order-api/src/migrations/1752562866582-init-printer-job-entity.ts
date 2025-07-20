import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPrinterJobEntity1752562866582 implements MigrationInterface {
  name = 'InitPrinterJobEntity1752562866582';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`printer_job_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`job_type_column\` varchar(255) NOT NULL, \`status_column\` varchar(255) NOT NULL, \`data_column\` varchar(255) NOT NULL, \`error_column\` varchar(255) NULL, \`printer_ip_column\` varchar(255) NOT NULL, \`printer_port_column\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_d62daa5bc57d3537eacf1398db\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );

    // add index for status and created_at
    await queryRunner.query(`
      CREATE INDEX \`idx_status_created_at\`
      ON \`printer_job_tbl\` (\`status_column\`, \`created_at_column\`);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drop index for status and created_at
    await queryRunner.query(`
      DROP INDEX \`idx_status_created_at\` ON \`printer_job_tbl\`;
    `);

    await queryRunner.query(
      `DROP INDEX \`IDX_d62daa5bc57d3537eacf1398db\` ON \`printer_job_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`printer_job_tbl\``);
  }
}
