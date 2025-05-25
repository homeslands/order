import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLossPropertyForInvoiceEntity1747384555453
  implements MigrationInterface
{
  name = 'AddLossPropertyForInvoiceEntity1747384555453';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`loss_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`loss_column\``,
    );
  }
}
