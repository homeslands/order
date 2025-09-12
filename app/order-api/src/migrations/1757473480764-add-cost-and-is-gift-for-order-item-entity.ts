import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCostAndIsGiftForOrderItemEntity1757473480764
  implements MigrationInterface
{
  name = 'AddCostAndIsGiftForOrderItemEntity1757473480764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` ADD \`subtotal_cost_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` ADD \`is_gift_column\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` DROP COLUMN \`is_gift_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` DROP COLUMN \`subtotal_cost_column\``,
    );
  }
}
