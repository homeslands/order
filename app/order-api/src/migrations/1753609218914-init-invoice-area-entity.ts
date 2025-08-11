import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitInvoiceAreaEntity1753609218914 implements MigrationInterface {
  name = 'InitInvoiceAreaEntity1753609218914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`invoice_area_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`description_column\` varchar(255) NULL, UNIQUE INDEX \`IDX_51fa9c058a07956667f60a0f34\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_51fa9c058a07956667f60a0f34\` ON \`invoice_area_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`invoice_area_tbl\``);
  }
}
