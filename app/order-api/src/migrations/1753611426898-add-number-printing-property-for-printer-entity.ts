import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNumberPrintingPropertyForPrinterEntity1753611426898
  implements MigrationInterface
{
  name = 'AddNumberPrintingPropertyForPrinterEntity1753611426898';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` ADD \`number_printing_column\` int NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` DROP COLUMN \`number_printing_column\``,
    );
  }
}
