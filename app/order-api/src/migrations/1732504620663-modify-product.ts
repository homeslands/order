import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyProduct1732504620663 implements MigrationInterface {
  name = 'ModifyProduct1732504620663';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` DROP COLUMN \`description_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` ADD \`description_column\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` DROP COLUMN \`description_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` ADD \`description_column\` varchar(255) NULL`,
    );
  }
}
