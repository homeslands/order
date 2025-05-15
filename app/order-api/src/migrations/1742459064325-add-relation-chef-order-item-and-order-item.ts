import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationChefOrderItemAndOrderItem1742459064325
  implements MigrationInterface
{
  name = 'AddRelationChefOrderItemAndOrderItem1742459064325';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_order_item_tbl\` ADD \`order_item_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_order_item_tbl\` ADD CONSTRAINT \`FK_a3a197e5e16604d144de77cbc77\` FOREIGN KEY (\`order_item_column\`) REFERENCES \`order_item_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_order_item_tbl\` DROP FOREIGN KEY \`FK_a3a197e5e16604d144de77cbc77\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_order_item_tbl\` DROP COLUMN \`order_item_column\``,
    );
  }
}
