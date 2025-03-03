import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerifyEmailTokenEntity1740728310218
  implements MigrationInterface
{
  name = 'AddVerifyEmailTokenEntity1740728310218';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`verify_email_token_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`token_column\` varchar(255) NOT NULL, \`email_column\` varchar(255) NOT NULL, \`expires_at_column\` datetime NOT NULL, \`user_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_a5ae65d4551cebc9a80e7cd3e6\` (\`slug_column\`), UNIQUE INDEX \`IDX_93d32eddc2390dfc691afe64c3\` (\`token_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`verify_email_token_tbl\` ADD CONSTRAINT \`FK_2da12e2821727647bbc49e9daa8\` FOREIGN KEY (\`user_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`verify_email_token_tbl\` DROP FOREIGN KEY \`FK_2da12e2821727647bbc49e9daa8\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_93d32eddc2390dfc691afe64c3\` ON \`verify_email_token_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_a5ae65d4551cebc9a80e7cd3e6\` ON \`verify_email_token_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`verify_email_token_tbl\``);
  }
}
