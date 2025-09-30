import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationFeatureSystemGroupAndFeatureFlagSystemEntity1758789050812
  implements MigrationInterface
{
  name = 'AddRelationFeatureSystemGroupAndFeatureFlagSystemEntity1758789050812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_system_tbl\` ADD \`group_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_system_tbl\` ADD CONSTRAINT \`FK_534f1b303c54c1a7f5bba8d8af7\` FOREIGN KEY (\`group_column\`) REFERENCES \`feature_system_group_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_system_tbl\` DROP FOREIGN KEY \`FK_534f1b303c54c1a7f5bba8d8af7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`feature_flag_system_tbl\` DROP COLUMN \`group_column\``,
    );
  }
}
