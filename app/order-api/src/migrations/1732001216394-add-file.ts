import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFile1732001216394 implements MigrationInterface {
  name = 'AddFile1732001216394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`file_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`name_column\` varchar(255) NOT NULL, \`extension_column\` varchar(255) NOT NULL, \`mimetype_column\` varchar(255) NOT NULL, \`data_column\` longtext NOT NULL, \`size_column\` int NULL, UNIQUE INDEX \`IDX_0b38ff05efa08c751e1c8ddbed\` (\`slug_column\`), UNIQUE INDEX \`IDX_02e58ac0aba8c4af4eaa961e85\` (\`name_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_02e58ac0aba8c4af4eaa961e85\` ON \`file_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_0b38ff05efa08c751e1c8ddbed\` ON \`file_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`file_tbl\``);
  }
}
