import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackingOrderItemTable1732335365260
  implements MigrationInterface
{
  name = 'AddTrackingOrderItemTable1732335365260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tracking_order_item_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`quantity_column\` int NOT NULL, UNIQUE INDEX \`IDX_1dd29fb24e3c13871727fede81\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_1dd29fb24e3c13871727fede81\` ON \`tracking_order_item_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`tracking_order_item_tbl\``);
  }
}
