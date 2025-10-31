import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationEntity1761798560433
  implements MigrationInterface
{
  name = 'UpdateNotificationEntity1761798560433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification_tbl\` ADD \`link_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_tbl\` ADD \`title_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_tbl\` ADD \`body_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_tbl\` ADD \`language_column\` varchar(255) NOT NULL DEFAULT 'vi'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification_tbl\` DROP COLUMN \`language_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_tbl\` DROP COLUMN \`link_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_tbl\` DROP COLUMN \`title_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_tbl\` DROP COLUMN \`body_column\``,
    );
  }
}
