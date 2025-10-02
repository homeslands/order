import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOrderNumberInFeatureFlagSystemAndFeatureGroupSystemEntity1759372603229
  implements MigrationInterface
{
  name =
    'RemoveOrderNumberInFeatureFlagSystemAndFeatureGroupSystemEntity1759372603229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feature_system_group_tbl\` DROP COLUMN \`order_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_system_tbl\` DROP COLUMN \`order_column\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_system_tbl\` ADD \`order_column\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`feature_system_group_tbl\` ADD \`order_column\` int NOT NULL`,
    );
  }
}
