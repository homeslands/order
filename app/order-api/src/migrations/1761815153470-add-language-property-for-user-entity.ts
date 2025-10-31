import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLanguagePropertyForUserEntity1761815153470
  implements MigrationInterface
{
  name = 'AddLanguagePropertyForUserEntity1761815153470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD \`language_column\` varchar(255) NOT NULL DEFAULT 'vi'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP COLUMN \`language_column\``,
    );
  }
}
