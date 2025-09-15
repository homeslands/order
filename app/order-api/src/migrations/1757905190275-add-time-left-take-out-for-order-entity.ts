import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimeLeftTakeOutForOrderEntity1757905190275
  implements MigrationInterface
{
  name = 'AddTimeLeftTakeOutForOrderEntity1757905190275';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`time_left_take_out_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`time_left_take_out_column\``,
    );
  }
}
