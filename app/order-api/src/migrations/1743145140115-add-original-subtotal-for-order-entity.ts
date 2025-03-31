import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOriginalSubtotalForOrderEntity1743145140115
  implements MigrationInterface
{
  name = 'AddOriginalSubtotalForOrderEntity1743145140115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`original_subtotal_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`original_subtotal_column\``,
    );
  }
}
