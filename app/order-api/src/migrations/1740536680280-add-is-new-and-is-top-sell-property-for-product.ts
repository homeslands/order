import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsNewAndIsTopSellPropertyForProduct1740536680280
  implements MigrationInterface
{
  name = 'AddIsNewAndIsTopSellPropertyForProduct1740536680280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` ADD \`is_top_sell\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` ADD \`isNew\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` DROP COLUMN \`isNew\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` DROP COLUMN \`is_top_sell\``,
    );
  }
}
