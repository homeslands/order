import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSaleQuantityHistoryPropertyForProduct1741226782876
  implements MigrationInterface
{
  name = 'AddSaleQuantityHistoryPropertyForProduct1741226782876';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` ADD \`sale_quantity_history\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_tbl\` DROP COLUMN \`sale_quantity_history\``,
    );
  }
}
