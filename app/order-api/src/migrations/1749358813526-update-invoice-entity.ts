import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvoiceEntity1749358813526 implements MigrationInterface {
  name = 'UpdateInvoiceEntity1749358813526';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`value_each_voucher_column\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`voucher_type_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`voucher_type_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`value_each_voucher_column\``,
    );
  }
}
