import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyInvoice1733297365583 implements MigrationInterface {
  name = 'ModifyInvoice1733297365583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`qrcode_column\` text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`qrcode_column\``,
    );
  }
}
