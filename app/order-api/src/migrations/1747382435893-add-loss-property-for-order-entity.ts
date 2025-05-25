import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLossPropertyForOrderEntity1747382435893
  implements MigrationInterface
{
  name = 'AddLossPropertyForOrderEntity1747382435893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`loss_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`loss_column\``,
    );
  }
}
