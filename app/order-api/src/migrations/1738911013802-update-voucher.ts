import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVoucher1738911013802 implements MigrationInterface {
  name = 'UpdateVoucher1738911013802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`value_column\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`is_active_column\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`is_active_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`value_column\``,
    );
  }
}
