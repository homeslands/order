import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvoiceEntityForDeliveryType1758186142110
  implements MigrationInterface
{
  name = 'UpdateInvoiceEntityForDeliveryType1758186142110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`type_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`delivery_phone_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`delivery_to_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`delivery_distance_column\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` ADD \`delivery_fee_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`delivery_fee_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`delivery_distance_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`delivery_to_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`delivery_phone_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invoice_tbl\` DROP COLUMN \`type_column\``,
    );
  }
}
