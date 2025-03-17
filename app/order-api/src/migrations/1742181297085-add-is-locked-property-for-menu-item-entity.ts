import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsLockedPropertyForMenuItemEntity1742181297085
  implements MigrationInterface
{
  name = 'AddIsLockedPropertyForMenuItemEntity1742181297085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` ADD \`is_locked_column\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` DROP COLUMN \`is_locked_column\``,
    );
  }
}
