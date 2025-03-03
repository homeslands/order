import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyOrder1734115167495 implements MigrationInterface {
  name = 'ModifyOrder1734115167495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`table_name_column\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`table_name_column\` varchar(255) NULL`,
    );
  }
}
