import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyOrderItemRelationTrackingOrderItem1732335645812
  implements MigrationInterface
{
  name = 'ModifyOrderItemRelationTrackingOrderItem1732335645812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tracking_order_item_tbl\` ADD \`order_item_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_order_item_tbl\` ADD CONSTRAINT \`FK_c4b269ab3e3a9a58463a9c91d32\` FOREIGN KEY (\`order_item_column\`) REFERENCES \`order_item_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tracking_order_item_tbl\` DROP FOREIGN KEY \`FK_c4b269ab3e3a9a58463a9c91d32\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_order_item_tbl\` DROP COLUMN \`order_item_column\``,
    );
  }
}
