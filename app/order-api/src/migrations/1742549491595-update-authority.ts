import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAuthority1742549491595 implements MigrationInterface {
  name = 'UpdateAuthority1742549491595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`authority_group_tbl\` ADD UNIQUE INDEX \`IDX_8fbda226d432a726f5b8207cbc\` (\`code_column\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`authority_tbl\` ADD UNIQUE INDEX \`IDX_2635c02d20a3ff0cabe97d5db8\` (\`code_column\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`authority_tbl\` DROP INDEX \`IDX_2635c02d20a3ff0cabe97d5db8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`authority_group_tbl\` DROP INDEX \`IDX_8fbda226d432a726f5b8207cbc\``,
    );
  }
}
