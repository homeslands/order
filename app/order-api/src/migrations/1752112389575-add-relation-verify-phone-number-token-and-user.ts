import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationVerifyPhoneNumberTokenAndUser1752112389575
  implements MigrationInterface
{
  name = 'AddRelationVerifyPhoneNumberTokenAndUser1752112389575';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`verify_phone_number_token_tbl\` ADD \`user_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`verify_phone_number_token_tbl\` ADD CONSTRAINT \`FK_303f6d94b113c2637aa9715f2bb\` FOREIGN KEY (\`user_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`verify_phone_number_token_tbl\` DROP FOREIGN KEY \`FK_303f6d94b113c2637aa9715f2bb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`verify_phone_number_token_tbl\` DROP COLUMN \`user_column\``,
    );
  }
}
