import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChefOrderItemEntity1742458249511 implements MigrationInterface {
  name = 'AddChefOrderItemEntity1742458249511';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`chef_order_item_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`status_column\` varchar(255) NOT NULL DEFAULT 'pending', \`default_quantity_column\` enum ('1') NOT NULL DEFAULT '1', UNIQUE INDEX \`IDX_c755bd9cc837412d89775cd4ad\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_c755bd9cc837412d89775cd4ad\` ON \`chef_order_item_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`chef_order_item_tbl\``);
  }
}
