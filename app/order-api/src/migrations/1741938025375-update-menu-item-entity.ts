import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMenuItemEntity1741938025375 implements MigrationInterface {
  name = 'UpdateMenuItemEntity1741938025375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` CHANGE \`default_stock_column\` \`default_stock_column\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` CHANGE \`current_stock_column\` \`current_stock_column\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` CHANGE \`current_stock_column\` \`current_stock_column\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`menu_item_tbl\` CHANGE \`default_stock_column\` \`default_stock_column\` int NOT NULL`,
    );
  }
}
