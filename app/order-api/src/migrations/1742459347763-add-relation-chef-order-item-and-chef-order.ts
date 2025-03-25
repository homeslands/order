import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelationChefOrderItemAndChefOrder1742459347763
  implements MigrationInterface
{
  name = 'AddRelationChefOrderItemAndChefOrder1742459347763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_order_item_tbl\` ADD \`chef_order_column\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_order_item_tbl\` ADD CONSTRAINT \`FK_b2d8c2f6747da0bf967eb7f0841\` FOREIGN KEY (\`chef_order_column\`) REFERENCES \`chef_order_tbl\`(\`id_column\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`chef_order_item_tbl\` DROP FOREIGN KEY \`FK_b2d8c2f6747da0bf967eb7f0841\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`chef_order_item_tbl\` DROP COLUMN \`chef_order_column\``,
    );
  }
}
