import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationPrinterAndInvoiceAreaEntity1753611068303
  implements MigrationInterface
{
  name = 'AddRelationPrinterAndInvoiceAreaEntity1753611068303';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` ADD \`invoice_area_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` ADD CONSTRAINT \`FK_46966c270fe4edcd4d87cbc2723\` FOREIGN KEY (\`invoice_area_column\`) REFERENCES \`invoice_area_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` DROP FOREIGN KEY \`FK_46966c270fe4edcd4d87cbc2723\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`printer_tbl\` DROP COLUMN \`invoice_area_column\``,
    );
  }
}
