import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccumulatedPointsToUsePropertyForOrderEntity1756518665582
  implements MigrationInterface
{
  name = 'AddAccumulatedPointsToUsePropertyForOrderEntity1756518665582';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`accumulated_points_to_use_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`accumulated_points_to_use_column\``,
    );
  }
}
