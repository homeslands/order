import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVerifiedEmailAndIsVerifiedPhonenumberForUserEntity1740727840650
  implements MigrationInterface
{
  name = 'AddIsVerifiedEmailAndIsVerifiedPhonenumberForUserEntity1740727840650';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD \`is_verified_email_column\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD \`is_verified_phonenumber_column\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP COLUMN \`is_verified_phonenumber_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP COLUMN \`is_verified_email_column\``,
    );
  }
}
