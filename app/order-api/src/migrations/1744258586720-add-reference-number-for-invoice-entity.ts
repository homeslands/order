import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReferenceNumberForInvoiceEntity1744258586720
  implements MigrationInterface
{
  name = 'AddReferenceNumberForInvoiceEntity1744258586720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`reference_number_column\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`reference_number_column\``,
    );
  }
}
