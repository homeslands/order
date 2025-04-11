import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromotionValueAndIdForInvoiceItemEntity1744359003564
  implements MigrationInterface
{
  name = 'AddPromotionValueAndIdForInvoiceItemEntity1744359003564';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` ADD \`promotion_value_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` ADD \`promotion_id_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` DROP COLUMN \`promotion_id_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_item_tbl\` DROP COLUMN \`promotion_value_column\``,
    );
  }
}
