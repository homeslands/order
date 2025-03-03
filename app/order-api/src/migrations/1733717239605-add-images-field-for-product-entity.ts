import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddImagesFieldForProductEntity1733717239605
  implements MigrationInterface
{
  name = 'AddImagesFieldForProductEntity1733717239605';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` ADD \`images_column\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` DROP COLUMN \`images_column\``,
    );
  }
}
