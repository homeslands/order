import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCard1747590051505 implements MigrationInterface {
  name = 'InitCard1747590051505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`card_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`title_column\` varchar(255) NOT NULL, \`image_column\` tinytext NULL, \`description_column\` text NULL, \`points_column\` decimal(10,2) NOT NULL, \`price_column\` decimal(10,2) NOT NULL, \`is_active_column\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_676037d2ab87f7ae48abd9b346\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_676037d2ab87f7ae48abd9b346\` ON \`card_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`card_tbl\``);
  }
}
