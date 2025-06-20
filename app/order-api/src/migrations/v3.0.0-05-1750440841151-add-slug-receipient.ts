import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugReceipient1750440841151 implements MigrationInterface {
  name = 'AddSlugReceipient1750440841151';
  receipientTable = 'recipient_tbl';
  userTable = 'user_tbl';
  cardOrderTable = 'card_order_tbl';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      !(await queryRunner.hasColumn(
        this.receipientTable,
        'recipient_slug_column',
      ))
    )
      await queryRunner.query(
        `ALTER TABLE \`recipient_tbl\` ADD \`recipient_slug_column\` varchar(255) NOT NULL`,
      );

    if (
      !(await queryRunner.hasColumn(this.receipientTable, 'sender_slug_column'))
    )
      await queryRunner.query(
        `ALTER TABLE \`recipient_tbl\` ADD \`sender_slug_column\` varchar(255) NOT NULL`,
      );

    if (
      !(await queryRunner.hasColumn(
        this.receipientTable,
        'card_order_slug_column',
      ))
    )
      await queryRunner.query(
        `ALTER TABLE \`recipient_tbl\` ADD \`card_order_slug_column\` varchar(255) NULL`,
      );

    await queryRunner.query(
      `UPDATE \`${this.receipientTable}\` r JOIN \`${this.userTable}\` u ON r.\`recipient_column\` = u.\`id_column\` SET r.\`recipient_slug_column\` = u.\`slug_column\``,
    );
    await queryRunner.query(
      `UPDATE \`${this.receipientTable}\` r JOIN \`${this.userTable}\` u ON r.\`sender_column\` = u.\`id_column\` SET r.\`sender_slug_column\` = u.\`slug_column\``,
    );
    await queryRunner.query(
      `UPDATE \`${this.receipientTable}\` r JOIN \`${this.cardOrderTable}\` co ON r.\`card_order_column\` = co.\`id_column\` SET r.\`card_order_slug_column\` = co.\`slug_column\``,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE \`${this.receipientTable}\` SET \`recipient_slug_column\` = NULL`,
    );
    await queryRunner.query(
      `UPDATE \`${this.receipientTable}\` SET \`sender_slug_column\` = NULL`,
    );
    await queryRunner.query(
      `UPDATE \`${this.receipientTable}\` SET \`card_order_column\` = NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE \`recipient_tbl\` DROP COLUMN \`card_order_slug_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipient_tbl\` DROP COLUMN \`sender_slug_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`recipient_tbl\` DROP COLUMN \`recipient_slug_column\``,
    );
  }
}
