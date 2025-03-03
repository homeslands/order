import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyMenu1733192689899 implements MigrationInterface {
  name = 'ModifyMenu1733192689899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` DROP COLUMN \`day_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` ADD \`is_template_column\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` ADD \`day_index_column\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` ADD \`image_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` DROP COLUMN \`image_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` DROP COLUMN \`day_index_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` DROP COLUMN \`is_template_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` ADD \`day_column\` varchar(255) NULL`,
    );
  }
}
