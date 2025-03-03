import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyStaticPage1737359386481 implements MigrationInterface {
  name = 'ModifyStaticPage1737359386481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`static_page_tbl\` CHANGE \`content_column\` \`content_column\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`static_page_tbl\` CHANGE \`content_column\` \`content_column\` text NOT NULL`,
    );
  }
}
