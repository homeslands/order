import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchRevenue1735201893252 implements MigrationInterface {
  name = 'AddBranchRevenue1735201893252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`revenue_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`total_amount_column\` int NOT NULL, \`branch_id_column\` varchar(255) NOT NULL, \`date_column\` datetime NOT NULL, \`total_order_column\` int NOT NULL, UNIQUE INDEX \`IDX_7337bb7da7b69a427d51f6f51a\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`branch_revenue_tbl\` (\`id_column\` varchar(36) NOT NULL, \`slug_column\` varchar(255) NOT NULL, \`created_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at_column\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at_column\` datetime(6) NULL, \`created_by_column\` varchar(255) NULL, \`total_amount_column\` int NOT NULL, \`branch_id_column\` varchar(255) NOT NULL, \`date_column\` datetime NOT NULL, \`total_order_column\` int NOT NULL, UNIQUE INDEX \`IDX_3c86fad63cc2ef454891670afb\` (\`slug_column\`), PRIMARY KEY (\`id_column\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_3c86fad63cc2ef454891670afb\` ON \`branch_revenue_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`branch_revenue_tbl\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_7337bb7da7b69a427d51f6f51a\` ON \`revenue_tbl\``,
    );
    await queryRunner.query(`DROP TABLE \`revenue_tbl\``);
  }
}
