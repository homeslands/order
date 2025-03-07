import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStaticPage1741248218132 implements MigrationInterface {
  name = 'UpdateStaticPage1741248218132';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`static_page_tbl\` DROP COLUMN \`content_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`static_page_tbl\` ADD \`content_column\` longtext NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`static_page_tbl\` DROP COLUMN \`content_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`static_page_tbl\` ADD \`content_column\` text NULL`,
    );
  }
}
