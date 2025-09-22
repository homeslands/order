import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrderEntityForDeliveryType1758179629433
  implements MigrationInterface
{
  name = 'UpdateOrderEntityForDeliveryType1758179629433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`delivery_phone_column\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`delivery_fee_column\` int NOT NULL DEFAULT '0'`,
    );

    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` ADD \`delivery_distance_column\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`delivery_distance_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`delivery_fee_column\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_tbl\` DROP COLUMN \`delivery_phone_column\``,
    );
  }
}
