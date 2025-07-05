import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPrinterEntity1751426061089 implements MigrationInterface {
  name = 'InitPrinterEntity1751426061089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`printer_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`data_type_column\` varchar(255) NOT NULL, \`ip_column\` varchar(255) NOT NULL, \`port_column\` varchar(255) NOT NULL, \`is_active_column\` tinyint NOT NULL DEFAULT 0, \`description_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_aedff262e5f3ad8531efcc1004\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_aedff262e5f3ad8531efcc1004\` ON \`printer_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`printer_tbl\``);
  }
}
