import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyUser1733542177027 implements MigrationInterface {
  name = 'ModifyUser1733542177027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD UNIQUE INDEX \`IDX_6b527900c8b5bd7bfcd592cef5\` (\`phonenumber_column\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` ADD UNIQUE INDEX \`IDX_eb1e609fc62d3df744f4dc69b3\` (\`email_column\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP INDEX \`IDX_eb1e609fc62d3df744f4dc69b3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_tbl\` DROP INDEX \`IDX_6b527900c8b5bd7bfcd592cef5\``,
    );
  }
}
