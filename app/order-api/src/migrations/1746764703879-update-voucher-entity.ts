import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVoucherEntity1746764703879 implements MigrationInterface {
  name = 'UpdateVoucherEntity1746764703879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`is_private_column\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`type_column\` varchar(255) NOT NULL DEFAULT 'percent_order'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` ADD \`number_of_usage_per_user_column\` int NOT NULL DEFAULT '1'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`number_of_usage_per_user_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`type_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`voucher_tbl\` DROP COLUMN \`is_private_column\``,
    );
  }
}
