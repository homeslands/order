import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitVerifyPhoneNumberTokenEntity1752112147687
  implements MigrationInterface
{
  name = 'InitVerifyPhoneNumberTokenEntity1752112147687';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`verify_phone_number_token_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`token_column\` varchar(255) NOT NULL, \`expires_at_column\` datetime NOT NULL, UNIQUE INDEX \`IDX_09f32a494149449fe43bcf1b25\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_09f32a494149449fe43bcf1b25\` ON \`verify_phone_number_token_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`verify_phone_number_token_tbl\``);
  }
}
