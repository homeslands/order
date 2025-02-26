import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForgotPasswordToken1733391041850 implements MigrationInterface {
  name = 'AddForgotPasswordToken1733391041850';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`forgot_password_token_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`token_column\` varchar(255) NOT NULL, \`expires_at_column\` datetime NOT NULL, \`user_column\` varchar(36) NULL, UNIQUE INDEX \`IDX_e6b9ea067239830e3d5a8b7074\` (\`slug_column\`), UNIQUE INDEX \`IDX_bc2f8bb110adec23777cfa118a\` (\`token_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`forgot_password_token_tbl\` ADD CONSTRAINT \`FK_38b33b8c2de4a94216c082b1dd0\` FOREIGN KEY (\`user_column\`) REFERENCES \`user_tbl\`(\`id_column\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`forgot_password_token_tbl\` DROP FOREIGN KEY \`FK_38b33b8c2de4a94216c082b1dd0\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bc2f8bb110adec23777cfa118a\` ON \`forgot_password_token_tbl\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e6b9ea067239830e3d5a8b7074\` ON \`forgot_password_token_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`forgot_password_token_tbl\``);
  }
}
