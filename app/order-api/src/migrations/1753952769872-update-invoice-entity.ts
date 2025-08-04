import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvoiceEntity1753952769872 implements MigrationInterface {
  name = 'UpdateInvoiceEntity1753952769872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`branch_id_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`date_column\` datetime NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`date_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`branch_id_column\``,
    );
  }
}
