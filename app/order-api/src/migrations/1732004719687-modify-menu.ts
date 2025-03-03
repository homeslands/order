import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyMenu1732004719687 implements MigrationInterface {
  name = 'ModifyMenu1732004719687';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` ADD \`date_column\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` CHANGE \`day_column\` \`day_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` CHANGE \`day_column\` \`day_column\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_tbl\` DROP COLUMN \`date_column\``,
    );
  }
}
