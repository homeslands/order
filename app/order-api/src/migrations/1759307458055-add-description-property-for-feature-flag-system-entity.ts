import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionPropertyForFeatureFlagSystemEntity1759307458055
  implements MigrationInterface
{
  name = 'AddDescriptionPropertyForFeatureFlagSystemEntity1759307458055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_system_tbl\` ADD \`description_column\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_system_tbl\` DROP COLUMN \`description_column\``,
    );
  }
}
