import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCostAndIsGiftForInvoiceItemEntity1757646116890
  implements MigrationInterface
{
  name = 'AddCostAndIsGiftForInvoiceItemEntity1757646116890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` ADD \`total_cost_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` ADD \`is_gift_column\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` DROP COLUMN \`is_gift_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` DROP COLUMN \`total_cost_column\``,
    );
  }
}
