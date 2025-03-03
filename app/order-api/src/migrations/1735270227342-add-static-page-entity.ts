import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStaticPageEntity1735270227342 implements MigrationInterface {
  name = 'AddStaticPageEntity1735270227342';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`static_page_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`key_column\` varchar(255) NOT NULL, \`title_column\` varchar(255) NOT NULL, \`content_column\` text NOT NULL, UNIQUE INDEX \`IDX_f10333d42e93d49662916d599c\` (\`slug_column\`), UNIQUE INDEX \`IDX_2f6329fff07000f5c21a57457e\` (\`key_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_2f6329fff07000f5c21a57457e\` ON \`static_page_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_f10333d42e93d49662916d599c\` ON \`static_page_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`static_page_tbl\``);
  }
}
