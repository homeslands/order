import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCardSlugInCardOrder1749828623238 implements MigrationInterface {
  name = 'AddCardSlugInCardOrder1749828623238';
  table = 'card_order_tbl';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn(this.table, 'card_slug_column')))
      await queryRunner.query(
        `ALTER TABLE \`card_order_tbl\` ADD \`card_slug_column\` varchar(255) NOT NULL`,
      );

    await queryRunner.query(
      `UPDATE \`card_order_tbl\` co JOIN \`card_tbl\` c ON co.\`card_column\` = c.\`id_column\` SET co.\`card_slug_column\` = c.\`slug_column\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`card_order_tbl\` SET \`card_slug_column\` = NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`card_order_tbl\` DROP COLUMN \`card_slug_column\``,
    );
  }
}
