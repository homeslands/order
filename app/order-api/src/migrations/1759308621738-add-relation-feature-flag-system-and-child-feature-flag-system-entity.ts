import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationFeatureFlagSystemAndChildFeatureFlagSystemEntity1759308621738
  implements MigrationInterface
{
  name =
    'AddRelationFeatureFlagSystemAndChildFeatureFlagSystemEntity1759308621738';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`child_feature_flag_system_tbl\` ADD \`feature_flag_system_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`child_feature_flag_system_tbl\` ADD CONSTRAINT \`FK_c96efaca09ad5ec917887179d92\` FOREIGN KEY (\`feature_flag_system_column\`) REFERENCES \`feature_flag_system_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`child_feature_flag_system_tbl\` DROP FOREIGN KEY \`FK_c96efaca09ad5ec917887179d92\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`child_feature_flag_system_tbl\` DROP COLUMN \`feature_flag_system_column\``,
    );
  }
}
