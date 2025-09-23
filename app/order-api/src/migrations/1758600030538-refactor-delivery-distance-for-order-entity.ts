import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorDeliveryDistanceForOrderEntity1758600030538
  implements MigrationInterface
{
  name = 'RefactorDeliveryDistanceForOrderEntity1758600030538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` MODIFY \`delivery_distance_column\` decimal(5,1) NOT NULL DEFAULT '0.0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` MODIFY \`delivery_distance_column\` int NOT NULL DEFAULT '0'`,
    );
  }
}
