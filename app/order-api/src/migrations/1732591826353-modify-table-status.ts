import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyTableStatus1732591826353 implements MigrationInterface {
  name = 'ModifyTableStatus1732591826353';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` CHANGE \`is_empty_column\` \`status_column\` tinyint NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` DROP COLUMN \`status_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` ADD \`status_column\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` DROP COLUMN \`status_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` ADD \`status_column\` tinyint NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` CHANGE \`status_column\` \`is_empty_column\` tinyint NOT NULL DEFAULT '1'`,
    );
  }
}
