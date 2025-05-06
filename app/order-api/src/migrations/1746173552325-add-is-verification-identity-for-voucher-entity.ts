import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVerificationIdentityForVoucherEntity1746173552325
  implements MigrationInterface
{
  name = 'AddIsVerificationIdentityForVoucherEntity1746173552325';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`is_verification_identity_column\` tinyint NOT NULL DEFAULT 1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`is_verification_identity_column\``,
    );
  }
}
