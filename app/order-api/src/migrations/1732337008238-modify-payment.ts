import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyPayment1732337008238 implements MigrationInterface {
  name = 'ModifyPayment1732337008238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` ADD \`qrcode_column\` text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` CHANGE \`status_code_column\` \`status_code_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` CHANGE \`status_message_column\` \`status_message_column\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` CHANGE \`status_message_column\` \`status_message_column\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` CHANGE \`status_code_column\` \`status_code_column\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`payment_tbl\` DROP COLUMN \`qrcode_column\``,
    );
  }
}
