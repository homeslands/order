import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderItemEntity1749191467595 implements MigrationInterface {
  name = 'UpdateOrderItemEntity1749191467595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` ADD \`discount_type_column\` varchar(255) NOT NULL DEFAULT 'none'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` ADD \`voucher_value_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` DROP COLUMN \`voucher_value_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` DROP COLUMN \`discount_type_column\``,
    );
  }
}
