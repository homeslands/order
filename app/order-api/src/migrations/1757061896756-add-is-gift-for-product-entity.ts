import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsGiftForProductEntity1757061896756
  implements MigrationInterface
{
  name = 'AddIsGiftForProductEntity1757061896756';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` ADD \`isGift\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` DROP COLUMN \`isGift\``,
    );
  }
}
