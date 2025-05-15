import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReferenceNumberForOrderEntity1744257470375
  implements MigrationInterface
{
  name = 'AddReferenceNumberForOrderEntity1744257470375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`reference_number_column\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`reference_number_column\``,
    );
  }
}
