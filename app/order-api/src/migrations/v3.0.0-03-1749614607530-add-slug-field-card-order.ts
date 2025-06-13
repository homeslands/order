import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugFieldCardOrder1749614607530 implements MigrationInterface {
  name = 'AddSlugFieldCardOrder1749614607530';
  table = 'card_order_tbl';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn(this.table, 'customer_slug_column')))
      await queryRunner.query(
        `ALTER TABLE \`card_order_tbl\` ADD \`customer_slug_column\` varchar(255) NOT NULL`,
      );

    if (!(await queryRunner.hasColumn(this.table, 'cashier_slug_column')))
      await queryRunner.query(
        `ALTER TABLE \`card_order_tbl\` ADD \`cashier_slug_column\` varchar(255) NULL`,
      );

    if (!(await queryRunner.hasColumn(this.table, 'payment_slug_column')))
      await queryRunner.query(
        `ALTER TABLE \`card_order_tbl\` ADD \`payment_slug_column\` varchar(255) NULL`,
      );

    if (!(await queryRunner.hasColumn(this.table, 'payment_id_column')))
      await queryRunner.query(
        `ALTER TABLE \`card_order_tbl\` ADD \`payment_id_column\` varchar(255) NULL`,
      );

    await queryRunner.query(
      `UPDATE \`card_order_tbl\` co JOIN \`user_tbl\` u ON co.\`customer_column\` = u.\`id_column\` SET co.\`customer_slug_column\` = u.\`slug_column\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`card_order_tbl\` SET \`customer_slug_column\` = NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` DROP COLUMN \`payment_id_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` DROP COLUMN \`payment_slug_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` DROP COLUMN \`cashier_slug_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` DROP COLUMN \`customer_slug_column\``,
    );
  }
}
