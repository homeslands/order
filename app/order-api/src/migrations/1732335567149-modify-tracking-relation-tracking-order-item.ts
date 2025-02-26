import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifyTrackingRelationTrackingOrderItem1732335567149
  implements MigrationInterface
{
  name = 'ModifyTrackingRelationTrackingOrderItem1732335567149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tracking_order_item_tbl\` ADD \`tracking_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_order_item_tbl\` ADD CONSTRAINT \`FK_25cf873f91a2ace41675f0bda72\` FOREIGN KEY (\`tracking_column\`) REFERENCES \`tracking_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tracking_order_item_tbl\` DROP FOREIGN KEY \`FK_25cf873f91a2ace41675f0bda72\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tracking_order_item_tbl\` DROP COLUMN \`tracking_column\``,
    );
  }
}
