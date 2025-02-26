import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVoucher1739329801979 implements MigrationInterface {
  name = 'UpdateVoucher1739329801979';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`remaining_usage_column\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`value_type_column\` varchar(255) NOT NULL DEFAULT 'percentage'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`value_type_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`remaining_usage_column\``,
    );
  }
}
