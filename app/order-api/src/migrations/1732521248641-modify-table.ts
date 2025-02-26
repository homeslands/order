import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyTable1732521248641 implements MigrationInterface {
  name = 'ModifyTable1732521248641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` ADD \`x_position_column\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` ADD \`y_position_column\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` DROP COLUMN \`y_position_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`table_tbl\` DROP COLUMN \`x_position_column\``,
    );
  }
}
