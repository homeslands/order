import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsComboForProductEntity1750670102294
  implements MigrationInterface
{
  name = 'AddIsComboForProductEntity1750670102294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` ADD \`is_combo_column\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` DROP COLUMN \`is_combo_column\``,
    );
  }
}
