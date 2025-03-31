import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOriginalSubtotalForOrderItemEntity1743145404063
  implements MigrationInterface
{
  name = 'AddOriginalSubtotalForOrderItemEntity1743145404063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` ADD \`original_subtotal_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_item_tbl\` DROP COLUMN \`original_subtotal_column\``,
    );
  }
}
