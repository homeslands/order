import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccumulatedPointsToUsePropertyForInvoiceEntity1756518978955
  implements MigrationInterface
{
  name = 'AddAccumulatedPointsToUsePropertyForInvoiceEntity1756518978955';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`accumulated_points_to_use_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`accumulated_points_to_use_column\``,
    );
  }
}
