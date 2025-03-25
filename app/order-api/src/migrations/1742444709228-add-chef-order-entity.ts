import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChefOrderEntity1742444709228 implements MigrationInterface {
  name = 'AddChefOrderEntity1742444709228';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`chef_order_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`status_column\` varchar(255) NOT NULL DEFAULT 'pending', UNIQUE INDEX \`IDX_00aa1fbd64e2850cd0e63d6f76\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_00aa1fbd64e2850cd0e63d6f76\` ON \`chef_order_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`chef_order_tbl\``);
  }
}
