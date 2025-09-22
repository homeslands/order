import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAddressEntity1758167614543 implements MigrationInterface {
  name = 'InitAddressEntity1758167614543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`address_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`formatted_address_column\` varchar(255) NOT NULL, \`url_column\` text NOT NULL, \`lat_column\` decimal(10,8) NOT NULL, \`lng_column\` decimal(11,8) NOT NULL, \`place_id_column\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_f8cdec1f2727c4a3ccf8a005e6\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_f8cdec1f2727c4a3ccf8a005e6\` ON \`address_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`address_tbl\``);
  }
}
