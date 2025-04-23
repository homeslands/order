import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionForOrderEntity1745314385368
  implements MigrationInterface
{
  name = 'AddDescriptionForOrderEntity1745314385368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`description_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`description_column\``,
    );
  }
}
